import csv
import io
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user_models import CreateUserRequest, User

DEFAULT_PASSWORD = "PhishX@2025"


def create_user(data: CreateUserRequest):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            return {"error": "User already exists"}
        new_user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role,
            department=data.department.upper(),
            must_change_password=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"message": "User created successfully", "user_id": new_user.id}
    finally:
        db.close()


def bulk_create_users(file_content: bytes):
    db = SessionLocal()
    results = []
    try:
        content = file_content.decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        for row in reader:
            email = row.get("email", "").strip()
            department = row.get("department", "").strip().upper()
            role = row.get("role", "user").strip().lower()

            if not email or not department:
                results.append({"email": email, "status": "failed", "reason": "missing email or department"})
                continue
            if role not in ["user", "admin", "soc"]:
                results.append({"email": email, "status": "failed", "reason": "invalid role"})
                continue
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                results.append({"email": email, "status": "failed", "reason": "already exists"})
                continue
            new_user = User(
                email=email,
                password_hash=hash_password(DEFAULT_PASSWORD),
                role=role,
                department=department,
                must_change_password=True
            )
            db.add(new_user)
            db.commit()
            results.append({
                "email": email,
                "department": department,
                "role": role,
                "temp_password": DEFAULT_PASSWORD,
                "status": "created"
            })
    except Exception as e:
        results.append({"email": "unknown", "status": "failed", "reason": str(e)})
    finally:
        db.close()
    return results


def get_all_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return [
            {
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "department": u.department,
                "must_change_password": u.must_change_password
            }
            for u in users
        ]
    finally:
        db.close()


def update_user(user_id: int, email: str, role: str, department: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        if email:
            user.email = email
        if role:
            user.role = role
        if department:
            user.department = department.upper()
        db.commit()
        return {"message": "User updated successfully"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


def delete_user(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


def get_user_risk(user_id: int):
    db = SessionLocal()
    try:
        from app.models.risk_model import RiskProfile
        profile = db.query(RiskProfile).filter(
            RiskProfile.user_id == user_id
        ).first()
        if not profile:
            return {
                "risk_score": 0,
                "trend": "stable",
                "total_clicks": 0,
                "total_reports": 0,
                "total_emails": 0
            }
        return {
            "risk_score": profile.risk_score,
            "trend": profile.trend,
            "total_clicks": profile.total_clicks,
            "total_reports": profile.total_reports,
            "total_emails": profile.total_emails
        }
    finally:
        db.close()