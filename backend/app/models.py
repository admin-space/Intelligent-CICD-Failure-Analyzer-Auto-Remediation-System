# SQLAlchemy Database Models definition for CloudWise AI
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Date, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="admin") # admin, manager, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

class CloudResource(Base):
    __tablename__ = "cloud_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    provider = Column(String, index=True, default="aws") # aws, azure, gcp
    type = Column(String) # ec2, s3, rds, ebs, eip, etc.
    region = Column(String)
    status = Column(String) # running, stopped, available, in-use, orphan
    estimated_monthly_cost = Column(Float, default=0.0)
    details = Column(JSON) # arbitrary metadata (CPU %, instance_type, volume_size, tags, etc.)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    created_at = Column(DateTime, default=utc_now)
    
    recommendations = relationship("Recommendation", back_populates="resource", cascade="all, delete-orphan")

class CostMetric(Base):
    __tablename__ = "cost_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    provider = Column(String, index=True, default="aws")
    service = Column(String, index=True) # Amazon Elastic Compute Cloud - Compute, Amazon Simple Storage Service, etc.
    region = Column(String)
    amount = Column(Float)
    currency = Column(String, default="USD")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_db_id = Column(Integer, ForeignKey("cloud_resources.id", ondelete="CASCADE"), nullable=True)
    resource_id = Column(String, index=True) # external resource id (e.g. i-01234, vol-05678)
    resource_name = Column(String, nullable=True)
    service_type = Column(String, default="EC2") # EC2, EBS, RDS, S3, EIP
    action_type = Column(String) # stop_instance, delete_volume, release_eip, resize_instance
    current_state = Column(String) # e.g. "m5.2xlarge running <2% CPU"
    recommended_state = Column(String) # e.g. "Stop instance or resize to t3.medium"
    estimated_savings = Column(Float) # monthly cost savings
    ai_explanation = Column(Text) # markdown text explanation
    risk_assessment = Column(String, default="low") # low, medium, high
    confidence_score = Column(Float, default=0.95) # 0.0 to 1.0
    status = Column(String, default="active") # active, remediating, remediated, dismissed
    remediated_at = Column(DateTime, nullable=True)
    remediation_log = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    resource = relationship("CloudResource", back_populates="recommendations")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    amount = Column(Float)
    provider = Column(String, default="aws") # total, aws, azure, gcp
    threshold_percentage = Column(Float, default=80.0) # alert if spend > threshold%
    emails = Column(String, default="") # comma-separated list
    slack_webhook = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question = Column(String)
    answer = Column(Text)
    timestamp = Column(DateTime, default=utc_now)
