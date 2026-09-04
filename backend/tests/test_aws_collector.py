import pytest
from app.collectors.aws_collector import aws_collector

def test_aws_collector_connection_test():
    conn = aws_collector.test_connection()
    assert "connected" in conn
    assert "region" in conn
    assert "mode" in conn

def test_aws_collector_mock_fallbacks():
    costs = aws_collector.collect_cost_explorer(days=7)
    assert len(costs) > 0
    assert "amount" in costs[0]
    assert "service" in costs[0]

    ec2 = aws_collector.collect_ec2_instances()
    assert len(ec2) > 0
    assert ec2[0]["type"] == "ec2"

    ebs = aws_collector.collect_ebs_volumes()
    assert len(ebs) > 0
    assert ebs[0]["type"] == "ebs"

    eips = aws_collector.collect_elastic_ips()
    assert len(eips) > 0
    assert eips[0]["type"] == "eip"
