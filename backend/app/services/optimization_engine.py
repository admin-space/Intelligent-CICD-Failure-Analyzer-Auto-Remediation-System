# CloudWise AI - Waste Detection & Optimization Engine
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any
import logging

from app.models import CloudResource, Recommendation
from app.collectors.aws_collector import aws_collector

logger = logging.getLogger("cloudwise-optimization-engine")

class OptimizationEngine:
    def scan_and_generate_recommendations(self, db: Session) -> List[Recommendation]:
        """Inspect all active cloud resources, evaluate FinOps waste rules, and create recommendations."""
        # 1. Sync latest resources from AWS
        aws_collector.sync_all(db)
        
        resources = db.query(CloudResource).all()
        generated = []

        for res in resources:
            # Check if an active recommendation already exists for this resource
            existing = db.query(Recommendation).filter(
                Recommendation.resource_id == res.resource_id,
                Recommendation.status.in_(["active", "remediating"])
            ).first()
            if existing:
                continue

            # Rule 1: Idle EC2 Instance (CPU < 5% over 7 days)
            if res.type == "ec2" and res.status == "running":
                details = res.details or {}
                avg_cpu = float(details.get("cpu_utilization_avg", 100.0))
                inst_type = details.get("instance_type", "m5.large")
                
                if avg_cpu < 5.0:
                    savings = res.estimated_monthly_cost
                    rec = Recommendation(
                        resource_db_id=res.id,
                        resource_id=res.resource_id,
                        resource_name=res.name,
                        service_type="EC2",
                        action_type="stop_instance",
                        current_state=f"{inst_type} running at {avg_cpu:.1f}% avg CPU over 7 days (${savings:.2f}/mo)",
                        recommended_state="Stop or decommission idle instance",
                        estimated_savings=savings,
                        ai_explanation=f"CloudWatch telemetry shows {res.name} has averaged only {avg_cpu:.1f}% CPU over the past week with minimal I/O traffic. Stopping this instance will eliminate **${savings:.2f}/month** in compute charges while preserving its EBS storage.",
                        risk_assessment="low",
                        confidence_score=0.96,
                        status="active"
                    )
                    db.add(rec)
                    generated.append(rec)

            # Rule 2: Unattached / Orphaned EBS Volume
            elif res.type == "ebs" and res.status == "orphan":
                details = res.details or {}
                size = details.get("size_gib", 100)
                savings = res.estimated_monthly_cost
                
                rec = Recommendation(
                    resource_db_id=res.id,
                    resource_id=res.resource_id,
                    resource_name=res.name,
                    service_type="EBS",
                    action_type="delete_volume",
                    current_state=f"{size}GB unattached volume in 'available' state (${savings:.2f}/mo)",
                    recommended_state="Create safety snapshot backup and purge orphaned volume",
                    estimated_savings=savings,
                    ai_explanation=f"Volume {res.resource_id} has been detached from any EC2 instance for >14 days. AWS continues billing for provisioned GiB storage. Auto-healing will capture a point-in-time snapshot before purging, recovering **${savings:.2f}/month** with zero data loss risk.",
                    risk_assessment="low",
                    confidence_score=0.99,
                    status="active"
                )
                db.add(rec)
                generated.append(rec)

            # Rule 3: Unassociated Elastic IP
            elif res.type == "eip" and res.status == "orphan":
                savings = 3.60
                rec = Recommendation(
                    resource_db_id=res.id,
                    resource_id=res.resource_id,
                    resource_name=res.name,
                    service_type="EIP",
                    action_type="release_eip",
                    current_state="Public IPv4 allocated but not associated to any active instance/ENI",
                    recommended_state="Release unassociated Elastic IP back to AWS pool",
                    estimated_savings=savings,
                    ai_explanation=f"AWS charges an hourly fee for allocated IPv4 addresses that are not associated with a running instance. Releasing {res.resource_id} stops the idle billing penalty of **$3.60/month**.",
                    risk_assessment="low",
                    confidence_score=1.0,
                    status="active"
                )
                db.add(rec)
                generated.append(rec)

            # Rule 4: Idle RDS Database (0 active connections)
            elif res.type == "rds" and res.status == "available":
                details = res.details or {}
                conn_avg = details.get("connections_avg", 0)
                if conn_avg == 0:
                    savings = round(res.estimated_monthly_cost * 0.7, 2)
                    rec = Recommendation(
                        resource_db_id=res.id,
                        resource_id=res.resource_id,
                        resource_name=res.name,
                        service_type="RDS",
                        action_type="stop_instance",
                        current_state=f"{details.get('instance_class', 'db.r5.large')} with 0 active client connections",
                        recommended_state="Pause dev database during non-business hours",
                        estimated_savings=savings,
                        ai_explanation=f"Database instance {res.resource_id} registered 0 active queries over the last monitoring interval. Scheduling auto-pause or downsizing to db.t3.medium will save approximately **${savings:.2f}/month**.",
                        risk_assessment="medium",
                        confidence_score=0.88,
                        status="active"
                    )
                    db.add(rec)
                    generated.append(rec)

        db.commit()
        logger.info(f"Waste detection scan complete. Generated {len(generated)} new actionable recommendations.")
        return generated

optimization_engine = OptimizationEngine()
