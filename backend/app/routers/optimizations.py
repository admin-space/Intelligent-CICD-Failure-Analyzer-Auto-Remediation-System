# Cost Optimizations & Auto-Healing API Router
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Recommendation
from app.schemas import RecommendationResponse, RecommendationUpdate, RemediateRequest, RemediateResponse
from app.services.optimization_engine import optimization_engine
from app.services.aws_remediator import aws_remediator

router = APIRouter()

@router.get("/", response_model=List[RecommendationResponse])
def list_recommendations(
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve list of cloud waste recommendations with AI explanations and risk ratings."""
    query = db.query(Recommendation)
    if status:
        query = query.filter(Recommendation.status == status)
    if service_type:
        query = query.filter(Recommendation.service_type == service_type)
    return query.order_by(Recommendation.estimated_savings.desc()).all()

@router.post("/scan", response_model=List[RecommendationResponse])
def trigger_infrastructure_scan(db: Session = Depends(get_db)):
    """Trigger manual scanner agent checking active and idle AWS resources for cost leaks."""
    recommendations = optimization_engine.scan_and_generate_recommendations(db=db)
    return db.query(Recommendation).order_by(Recommendation.estimated_savings.desc()).all()

@router.post("/{recommendation_id}/remediate", response_model=RemediateResponse)
def trigger_auto_healing(
    recommendation_id: int,
    payload: RemediateRequest = RemediateRequest(),
    db: Session = Depends(get_db)
):
    """Execute live Auto-Healing remediation directly on AWS with safety guardrails and backups."""
    success, message = aws_remediator.remediate(
        recommendation_id=recommendation_id,
        db=db,
        create_backup=payload.create_backup
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    return RemediateResponse(
        success=True,
        status="remediated",
        message="Auto-Healing action completed successfully.",
        remediation_log=message
    )

@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
def update_recommendation_status(
    recommendation_id: int,
    payload: RecommendationUpdate,
    db: Session = Depends(get_db)
):
    """Update status of recommendation (e.g. dismissed or approved)."""
    rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    rec.status = payload.status
    db.commit()
    db.refresh(rec)
    return rec
