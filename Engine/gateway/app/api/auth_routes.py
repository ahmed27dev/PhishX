from fastapi import APIRouter, HTTPException
from app.models.user_models import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_user

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    result = authenticate_user(request.email, request.password)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return result