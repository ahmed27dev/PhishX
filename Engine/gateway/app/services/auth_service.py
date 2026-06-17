from app.db.session import SessionLocal
from app.models.user_models import User
from app.core.security import verify_password, create_access_token
from app.core.logging_config import logger


def authenticate_user(email: str, password: str):
    db = SessionLocal()

    try:
        # Fetch active user
        user = (
            db.query(User)
            .filter(User.email == email, User.is_active == True)
            .first()
        )

        if not user:
            return None

        # Verify password
        if not verify_password(password, user.password_hash):
            return None

        # Create JWT
        token = create_access_token({
            "sub": str(user.id),
            "role": user.role
        })

        logger.info(f"User authenticated: {email}")

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        db.close()