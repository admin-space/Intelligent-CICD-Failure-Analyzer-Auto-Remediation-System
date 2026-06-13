# CloudWise AI - FastAPI Application Entrypoint
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloudwise-ai")

app = FastAPI(
    title="CloudWise AI API",
    description="Enterprise Multi-Cloud Cost Optimization & FinOps Auto-Healing Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return {"status": "healthy", "service": "cloudwise-api"}

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing CloudWise AI Database & Seeding Mock Data if DEMO_MODE is active...")
    # Seed functions go here

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down CloudWise AI services...")

# Routers will be registered here
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(costs.router, prefix="/api/costs", tags=["FinOps Cost Analytics"])
# app.include_router(optimizations.router, prefix="/api/optimizations", tags=["Cost Optimization & Remediation"])
# app.include_router(chat.router, prefix="/api/chat", tags=["AI Copilot Chat"])
# app.include_router(reports.router, prefix="/api/reports", tags=["Executive Reports"])
