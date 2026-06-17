from fastapi import APIRouter, Depends, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
from app.core.security import require_admin
from app.services.user_service import (
    create_user, bulk_create_users, get_all_users,
    update_user, delete_user, get_user_risk
)
from app.models.user_models import CreateUserRequest
from app.models.campaign_models import CreateCampaignRequest
from app.models.training_model import CreateTrainingRequest
from app.services.campaign_service import (
    create_campaign, activate_campaign,
    get_all_campaigns, deactivate_campaign,
    get_campaign_detail, get_audit_logs
)
from app.services.org_service import extract_and_store_org_style, get_org_style
from app.services.training_service import get_all_training_content, create_training_content

import os
import shutil
from fastapi.responses import FileResponse



router = APIRouter()


class UpdateUserRequest(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None


@router.get("/test")
def admin_test(user=Depends(require_admin)):
    return {"message": "Admin access granted"}


@router.post("/create-user")
def create_user_api(request: CreateUserRequest, user=Depends(require_admin)):
    return create_user(request)


@router.post("/bulk-upload-users")
async def bulk_upload_users(
    file: UploadFile = File(...),
    user=Depends(require_admin)
):
    content = await file.read()
    results = bulk_create_users(content)
    return {"results": results}


@router.get("/users")
def get_users(user=Depends(require_admin)):
    return get_all_users()


@router.put("/users/{user_id}")
def edit_user(user_id: int, request: UpdateUserRequest, user=Depends(require_admin)):
    return update_user(user_id, request.email, request.role, request.department)


@router.delete("/users/{user_id}")
def remove_user(user_id: int, user=Depends(require_admin)):
    return delete_user(user_id)


@router.get("/users/{user_id}/risk")
def get_risk(user_id: int, user=Depends(require_admin)):
    return get_user_risk(user_id)


@router.post("/create-campaign")
def create_campaign_api(request: CreateCampaignRequest, user=Depends(require_admin)):
    return create_campaign(request, actor_id=user["user_id"])


@router.post("/activate-campaign/{campaign_id}")
def activate_campaign_api(campaign_id: int, user=Depends(require_admin)):
    return activate_campaign(campaign_id, actor_id=user["user_id"])


@router.post("/deactivate-campaign/{campaign_id}")
def deactivate_campaign_api(campaign_id: int, user=Depends(require_admin)):
    return deactivate_campaign(campaign_id, actor_id=user["user_id"])


@router.get("/campaigns")
def get_campaigns(user=Depends(require_admin)):
    return get_all_campaigns()


@router.get("/campaigns/{campaign_id}/detail")
def campaign_detail(campaign_id: int, user=Depends(require_admin)):
    return get_campaign_detail(campaign_id)


@router.get("/audit-logs")
def audit_logs(user=Depends(require_admin)):
    return get_audit_logs()


# ─── Org Onboarding ───

@router.post("/upload-org-style")
async def upload_org_style(
    internal_files: List[UploadFile] = File(...),
    phishing_files: List[UploadFile] = File(default=[]),
    user=Depends(require_admin)
):
    internal_texts = []
    for f in internal_files:
        content = await f.read()
        internal_texts.append(content.decode("utf-8", errors="ignore"))
    phishing_texts = []
    for f in phishing_files:
        content = await f.read()
        phishing_texts.append(content.decode("utf-8", errors="ignore"))
    result = extract_and_store_org_style(internal_texts, phishing_texts)
    return result


@router.get("/org-style")
def get_org_style_api(user=Depends(require_admin)):
    return get_org_style()


# ─── Training Content ───

@router.get("/training")
def get_training(user=Depends(require_admin)):
    return get_all_training_content()


@router.post("/training")
def add_training(request: CreateTrainingRequest, user=Depends(require_admin)):
    return create_training_content(
        title=request.title,
        content_type=request.content_type,
        w3_content=request.w3_content,
        topic=request.topic,
        file_path=request.file_path,
        uploaded_by=user["user_id"]
    )


@router.delete("/training/{training_id}")
def delete_training(training_id: int, user=Depends(require_admin)):
    from app.db.session import SessionLocal
    from app.models.training_model import TrainingContent
    db = SessionLocal()
    try:
        item = db.query(TrainingContent).filter(
            TrainingContent.id == training_id
        ).first()
        if not item:
            return {"error": "Not found"}
        db.delete(item)
        db.commit()
        return {"message": "Deleted"}
    finally:
        db.close()



#PDF related 

UPLOAD_DIR = "/tmp/training_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/training/upload-file")
async def upload_training_file(
    file: UploadFile = File(...),
    user=Depends(require_admin)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"file_path": f"/admin/files/{file.filename}"}

@router.get("/files/{filename}")
def serve_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path,
        filename=filename,
        media_type="application/octet-stream"
    )