# Executive FinOps Reports API Router
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
import io
import csv

from app.database import get_db
from app.models import CloudResource, Recommendation, CostMetric
from app.services.cost_engine import cost_engine

router = APIRouter()

@router.get("/summary")
def get_executive_summary_report(db: Session = Depends(get_db)):
    """Generate high-level FinOps executive summary."""
    summary = cost_engine.get_dashboard_summary(db)
    active_recs = db.query(Recommendation).filter(Recommendation.status == "active").all()
    
    return {
        "title": "CloudWise AI - Executive FinOps & Waste Audit Report",
        "monthly_spend": summary["total_monthly_spend"],
        "projected_monthly_savings": summary["projected_savings"],
        "projected_annual_savings": round(summary["projected_savings"] * 12, 2),
        "total_active_resources": summary["active_resources_count"],
        "top_waste_opportunities": [
            {
                "service": r.service_type,
                "resource_id": r.resource_id,
                "state": r.current_state,
                "recommendation": r.recommended_state,
                "monthly_savings": r.estimated_savings,
                "risk": r.risk_assessment
            }
            for r in active_recs
        ]
    }

@router.get("/csv")
def download_cost_csv(db: Session = Depends(get_db)):
    """Download full inventory of AWS resources and cost metrics as CSV."""
    resources = db.query(CloudResource).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Resource ID", "Name", "Provider", "Type", "Region", "Status",
        "Est. Monthly Cost (USD)", "Details"
    ])
    
    for r in resources:
        writer.writerow([
            r.resource_id, r.name, r.provider, r.type, r.region, r.status,
            f"${r.estimated_monthly_cost:.2f}", str(r.details or {})
        ])
        
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cloudwise_aws_inventory.csv"}
    )
