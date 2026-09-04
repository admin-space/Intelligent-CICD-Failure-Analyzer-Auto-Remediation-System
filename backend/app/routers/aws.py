# AWS Management & Status API Router
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from app.database import get_db
from app.models import CloudResource
from app.schemas import AWSStatusResponse, AWSCredentialsUpdate
from app.config import settings
from app.collectors.aws_collector import aws_collector

logger = logging.getLogger("cloudwise-aws-router")

router = APIRouter()

@router.get("/status", response_model=AWSStatusResponse)
def get_aws_status(db: Session = Depends(get_db)):
    """Retrieve current AWS connection health, active region, and monitored resource counts."""
    conn = aws_collector.test_connection()
    
    resource_counts = {
        "ec2": db.query(CloudResource).filter(CloudResource.type == "ec2").count(),
        "ebs": db.query(CloudResource).filter(CloudResource.type == "ebs").count(),
        "eip": db.query(CloudResource).filter(CloudResource.type == "eip").count(),
        "rds": db.query(CloudResource).filter(CloudResource.type == "rds").count(),
        "s3": db.query(CloudResource).filter(CloudResource.type == "s3").count(),
    }
    
    return AWSStatusResponse(
        connected=conn.get("connected", False),
        account_id=conn.get("account_id"),
        region=conn.get("region", "us-east-1"),
        identity_arn=conn.get("identity_arn"),
        mode=conn.get("mode", "simulation"),
        resource_counts=resource_counts,
        last_synced_at=datetime.now(timezone.utc)
    )

@router.post("/credentials")
def update_aws_credentials(payload: AWSCredentialsUpdate, db: Session = Depends(get_db)):
    """Update and validate AWS credentials in real-time."""
    settings.AWS_ACCESS_KEY_ID = payload.aws_access_key_id.strip()
    settings.AWS_SECRET_ACCESS_KEY = payload.aws_secret_access_key.strip()
    settings.AWS_DEFAULT_REGION = payload.aws_default_region.strip() or "us-east-1"
    if payload.aws_session_token:
        settings.AWS_SESSION_TOKEN = payload.aws_session_token.strip()

    # Reset collector session and test
    aws_collector.region = settings.AWS_DEFAULT_REGION
    aws_collector.reset_session()
    
    conn = aws_collector.test_connection()
    if not conn.get("connected"):
        raise HTTPException(
            status_code=400,
            detail=f"Failed to authenticate with AWS credentials: {conn.get('error', 'Invalid keys')}"
        )
    
    # Trigger initial sync with newly verified credentials
    aws_collector.sync_all(db)
    
    return {
        "status": "success",
        "message": f"Successfully connected to AWS Account {conn.get('account_id')} in {conn.get('region')}.",
        "connection": conn
    }

@router.post("/sync")
def sync_aws_data(db: Session = Depends(get_db)):
    """Trigger manual data pull from AWS Cost Explorer, EC2, EBS, RDS, and S3."""
    res = aws_collector.sync_all(db)
    return res
