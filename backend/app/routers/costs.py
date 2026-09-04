# Cost Ingestion & Aggregation API Router
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import CloudResource, CostMetric
from app.schemas import CostSummaryResponse, CloudResourceResponse, CostBreakdownResponse
from app.services.cost_engine import cost_engine

router = APIRouter()

@router.get("/summary", response_model=CostSummaryResponse)
def get_cost_summary(
    days: int = Query(30, description="Number of days for trend history"),
    db: Session = Depends(get_db)
):
    """Retrieve summarized FinOps cost metrics, daily spending trend, and category breakdowns."""
    return cost_engine.get_dashboard_summary(db=db, days=days)

@router.get("/explorer", response_model=List[CloudResourceResponse])
def explore_resources(
    provider: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve granular inventory of multi-cloud resources with search & filter capabilities."""
    query = db.query(CloudResource)
    if provider:
        query = query.filter(CloudResource.provider == provider)
    if resource_type:
        query = query.filter(CloudResource.type == resource_type)
    if region:
        query = query.filter(CloudResource.region == region)
    if status:
        query = query.filter(CloudResource.status == status)
    return query.order_by(CloudResource.estimated_monthly_cost.desc()).all()
