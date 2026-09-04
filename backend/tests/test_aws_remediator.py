import pytest
from app.models import CloudResource, Recommendation
from app.services.aws_remediator import aws_remediator

def test_remediation_stop_ec2(db_session):
    res = CloudResource(
        resource_id="i-test-001",
        name="test-worker",
        type="ec2",
        status="running",
        estimated_monthly_cost=200.0,
        region="us-east-1"
    )
    db_session.add(res)
    db_session.commit()

    rec = Recommendation(
        resource_db_id=res.id,
        resource_id=res.resource_id,
        service_type="EC2",
        action_type="stop_instance",
        current_state="Running idle",
        recommended_state="Stop instance",
        estimated_savings=200.0,
        ai_explanation="Test explanation",
        status="active"
    )
    db_session.add(rec)
    db_session.commit()

    success, log = aws_remediator.remediate(rec.id, db_session)
    assert success is True
    assert rec.status == "remediated"
    assert res.status == "stopped"
    assert res.estimated_monthly_cost == 0.0

def test_remediation_delete_ebs(db_session):
    res = CloudResource(
        resource_id="vol-test-002",
        name="test-unattached-vol",
        type="ebs",
        status="orphan",
        estimated_monthly_cost=40.0,
        region="us-east-1"
    )
    db_session.add(res)
    db_session.commit()

    rec = Recommendation(
        resource_db_id=res.id,
        resource_id=res.resource_id,
        service_type="EBS",
        action_type="delete_volume",
        current_state="Unattached volume",
        recommended_state="Delete volume",
        estimated_savings=40.0,
        ai_explanation="Test explanation",
        status="active"
    )
    db_session.add(rec)
    db_session.commit()

    success, log = aws_remediator.remediate(rec.id, db_session, create_backup=True)
    assert success is True
    assert rec.status == "remediated"
    assert res.status == "deleted"
