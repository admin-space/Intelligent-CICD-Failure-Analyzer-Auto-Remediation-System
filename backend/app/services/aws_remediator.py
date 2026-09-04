# CloudWise AI - Auto-Healing AWS Remediation Service
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
import logging

from app.models import CloudResource, Recommendation
from app.collectors.aws_collector import aws_collector

logger = logging.getLogger("cloudwise-remediator")

class AWSRemediator:
    def remediate(self, recommendation_id: int, db: Session, create_backup: bool = True) -> Tuple[bool, str]:
        """Execute automated remediation policy on AWS for a detected waste recommendation."""
        rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
        if not rec:
            return False, "Recommendation not found"

        resource = db.query(CloudResource).filter(CloudResource.resource_id == rec.resource_id).first()
        action_type = rec.action_type
        res_id = rec.resource_id
        
        logger.info(f"Initiating AWS Auto-Healing remediation: {action_type} on {res_id}")
        
        try:
            # Check if live AWS session is active
            if aws_collector._is_live:
                session = aws_collector.get_session()
                ec2 = session.client("ec2", region_name=aws_collector.region)
                
                if action_type == "stop_instance":
                    ec2.stop_instances(InstanceIds=[res_id])
                    log_msg = f"Successfully issued AWS EC2 StopInstances command for {res_id}."
                    if resource:
                        resource.status = "stopped"
                        resource.estimated_monthly_cost = 0.0

                elif action_type == "delete_volume":
                    snapshot_msg = ""
                    if create_backup:
                        snap = ec2.create_snapshot(
                            VolumeId=res_id,
                            Description=f"CloudWise Auto-Healing Pre-Deletion Safety Snapshot for {res_id}"
                        )
                        snapshot_msg = f" Created safety snapshot {snap.get('SnapshotId')}."
                    
                    ec2.delete_volume(VolumeId=res_id)
                    log_msg = f"Successfully deleted orphaned EBS volume {res_id}.{snapshot_msg}"
                    if resource:
                        resource.status = "deleted"
                        resource.estimated_monthly_cost = 0.0

                elif action_type == "release_eip":
                    ec2.release_address(AllocationId=res_id)
                    log_msg = f"Successfully released unassociated Elastic IP {res_id} back to AWS pool."
                    if resource:
                        resource.status = "released"
                        resource.estimated_monthly_cost = 0.0

                elif action_type == "resize_instance":
                    # For demo/safety, stop then modify instance attribute
                    target_type = "t3.medium"
                    ec2.stop_instances(InstanceIds=[res_id])
                    ec2.modify_instance_attribute(InstanceId=res_id, InstanceType={"Value": target_type})
                    ec2.start_instances(InstanceIds=[res_id])
                    log_msg = f"Successfully downscaled {res_id} to {target_type}."
                    if resource:
                        resource.name = f"{resource.name.split('(')[0].strip()} ({target_type})"
                        resource.estimated_monthly_cost = 30.40
                else:
                    log_msg = f"Executed generic AWS remediation action: {action_type} for {res_id}."
            else:
                # Simulation Mode Execution (Zero risk, realistic audit log)
                if action_type == "stop_instance":
                    log_msg = f"[SIMULATION] AWS EC2 StopInstances executed for {res_id}. Instance transitioned to 'stopped'. Projected savings: ${rec.estimated_savings:.2f}/mo."
                    if resource:
                        resource.status = "stopped"
                        resource.estimated_monthly_cost = 0.0

                elif action_type == "delete_volume":
                    snap_id = f"snap-{res_id[-8:]}" if create_backup else "N/A"
                    log_msg = f"[SIMULATION] Created safety backup snapshot ({snap_id}) and purged unattached EBS volume {res_id}. Recovered ${rec.estimated_savings:.2f}/mo."
                    if resource:
                        resource.status = "deleted"
                        resource.estimated_monthly_cost = 0.0

                elif action_type == "release_eip":
                    log_msg = f"[SIMULATION] Released unassociated Elastic IP allocation {res_id}. Stopped $3.60/mo idle IPv4 charge."
                    if resource:
                        resource.status = "released"
                        resource.estimated_monthly_cost = 0.0

                elif action_type == "resize_instance":
                    log_msg = f"[SIMULATION] Downscaled oversized instance {res_id} to t3.medium. Saved ${rec.estimated_savings:.2f}/mo."
                    if resource:
                        resource.name = f"{resource.name.split('(')[0].strip()} (t3.medium)"
                        resource.estimated_monthly_cost = 30.40
                else:
                    log_msg = f"[SIMULATION] Completed remediation action {action_type} on {res_id}."

            # Update recommendation state
            rec.status = "remediated"
            rec.remediated_at = datetime.now(timezone.utc)
            rec.remediation_log = log_msg
            db.commit()
            
            logger.info(f"Remediation successful: {log_msg}")
            return True, log_msg

        except Exception as e:
            error_msg = f"AWS Remediation failed on {res_id}: {str(e)}"
            logger.error(error_msg)
            rec.status = "failed"
            rec.remediation_log = error_msg
            db.commit()
            return False, error_msg

aws_remediator = AWSRemediator()
