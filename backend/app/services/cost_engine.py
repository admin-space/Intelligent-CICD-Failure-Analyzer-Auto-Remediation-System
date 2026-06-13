# FinOps cost math aggregator
from sqlalchemy.orm import Session
from datetime import date

def calculate_costs_aggregate(db: Session, provider: str = None, start_date: date = None):
    """Summarize cloud spending by provider, region, or time bounds."""
    # Summary maths goes here
    pass
