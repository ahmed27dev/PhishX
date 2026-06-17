from fastapi import FastAPI
from app.api.routes import router as api_router
from app.api.health import router as health_router

app = FastAPI(
    title="Phishing Generator Service",
    description="Generates simulated phishing emails for training",
    version="2.1.0"
)

app.include_router(api_router)
app.include_router(health_router)
