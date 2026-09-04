# CloudWise AI - FinOps Cost Engine & Analytics Math Aggregator
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any
import logging

from app.models import CostMetric, CloudResource, Recommendation

logger = logging.getLogger("cloudwise-cost-engine")

class CostEngine:
    def get_dashboard_summary(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Compute top-level KPI metrics, trends, and service breakdowns."""
        # 1. Total projected savings from active recommendations
        savings_sum = db.query(func.sum(Recommendation.estimated_savings)).filter(
            Recommendation.status == "active"
        ).scalar() or 0.0

        # 2. Count of active cloud resources
        active_resources = db.query(CloudResource).filter(
            CloudResource.status.in_(["running", "in-use", "available", "active"])
        ).count()

        # 3. Monthly Spend from Cost Metrics (sum of last 30 days)
        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).date()
        total_spend = db.query(func.sum(CostMetric.amount)).filter(
            CostMetric.date >= cutoff_date
        ).scalar() or 0.0

        # Previous period spend for comparison
        prev_cutoff = (datetime.now(timezone.utc) - timedelta(days=days * 2)).date()
        prev_spend = db.query(func.sum(CostMetric.amount)).filter(
            CostMetric.date >= prev_cutoff,
            CostMetric.date < cutoff_date
        ).scalar() or total_spend

        spend_change = 0.0
        if prev_spend > 0:
            spend_change = round(((total_spend - prev_spend) / prev_spend) * 100, 1)

        # 4. Daily Spending Trend
        daily_query = db.query(
            CostMetric.date,
            func.sum(CostMetric.amount)
        ).filter(
            CostMetric.date >= cutoff_date
        ).group_by(CostMetric.date).order_by(CostMetric.date).all()

        daily_trends = [
            {"date": d.strftime("%b %d"), "spend": round(amount, 2)}
            for d, amount in daily_query
        ]

        # 5. Service Breakdown
        service_query = db.query(
            CostMetric.service,
            func.sum(CostMetric.amount)
        ).filter(
            CostMetric.date >= cutoff_date
        ).group_by(CostMetric.service).order_by(func.sum(CostMetric.amount).desc()).all()

        # Clean service names
        service_breakdown = []
        for s_name, amount in service_query:
            clean_name = s_name.replace("Amazon ", "").replace("AWS ", "").replace(" - Compute", "")
            service_breakdown.append({
                "service": clean_name,
                "amount": round(amount, 2),
                "percentage": round((amount / total_spend * 100) if total_spend > 0 else 0, 1)
            })

        # 6. Regional Breakdown
        regional_query = db.query(
            CloudResource.region,
            func.count(CloudResource.id),
            func.sum(CloudResource.estimated_monthly_cost)
        ).group_by(CloudResource.region).all()

        regional_breakdown = [
            {"region": r or "us-east-1", "count": count, "estimated_cost": round(cost or 0.0, 2)}
            for r, count, cost in regional_query
        ]

        return {
            "total_monthly_spend": round(total_spend, 2),
            "projected_savings": round(savings_sum, 2),
            "active_resources_count": active_resources,
            "spend_change_percentage": spend_change,
            "daily_trends": daily_trends,
            "service_breakdown": service_breakdown,
            "regional_breakdown": regional_breakdown
        }

cost_engine = CostEngine()
