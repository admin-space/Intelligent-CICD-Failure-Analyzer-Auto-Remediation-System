import pytest
from app.models import CloudResource, Recommendation

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_aws_status_endpoint(client):
    res = client.get("/api/aws/status")
    assert res.status_code == 200
    data = res.json()
    assert "region" in data
    assert "mode" in data
    assert "resource_counts" in data

def test_costs_summary_endpoint(client, db_session):
    res = client.get("/api/costs/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_monthly_spend" in data
    assert "projected_savings" in data
    assert "daily_trends" in data

def test_optimizations_scan_endpoint(client, db_session):
    res = client.post("/api/optimizations/scan")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_chat_copilot_endpoint(client, db_session):
    res = client.post("/api/chat/", json={"message": "Where is my cloud waste?"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 0

def test_reports_summary_endpoint(client, db_session):
    res = client.get("/api/reports/summary")
    assert res.status_code == 200
    data = res.json()
    assert "monthly_spend" in data

def test_reports_csv_endpoint(client, db_session):
    res = client.get("/api/reports/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
