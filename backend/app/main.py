# CloudWise AI - FastAPI Application Entrypoint
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_client import make_asgi_app
import logging

from app.database import engine, Base, SessionLocal
from app.routers import costs, optimizations, chat, reports, aws
from app.services.optimization_engine import optimization_engine
from app.models import CloudResource

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloudwise-ai")

# Initialize database schema
try:
    logger.info("Initializing CloudWise AI Database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Database initialization error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CloudWise AI service starting up...")
    db = SessionLocal()
    try:
        # Check if resources exist; if not, trigger initial scan & sync
        count = db.query(CloudResource).count()
        if count == 0:
            logger.info("No cloud resources detected. Running initial AWS discovery and waste scan...")
            optimization_engine.scan_and_generate_recommendations(db=db)
            logger.info("Initial AWS discovery scan complete.")
    except Exception as e:
        logger.warning(f"Startup scan encountered notice: {e}")
    finally:
        db.close()
    yield
    logger.info("CloudWise AI service shutting down...")

app = FastAPI(
    title="CloudWise AI API",
    description="Enterprise Multi-Cloud Cost Optimization & FinOps Auto-Healing Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Health endpoint
@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes."""
    return {"status": "healthy", "service": "cloudwise-api", "version": "1.0.0"}

# Register API Routers
app.include_router(costs.router, prefix="/api/costs", tags=["FinOps Cost Analytics"])
app.include_router(optimizations.router, prefix="/api/optimizations", tags=["Cost Optimization & Remediation"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Copilot Chat"])
app.include_router(reports.router, prefix="/api/reports", tags=["Executive Reports"])
app.include_router(aws.router, prefix="/api/aws", tags=["AWS Live Management"])
