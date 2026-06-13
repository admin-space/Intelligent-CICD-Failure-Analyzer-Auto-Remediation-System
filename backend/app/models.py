# SQLAlchemy Database Models definition for CloudWise AI
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="viewer") # admin, manager, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CloudResource(Base):
    __tablename__ = "cloud_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    provider = Column(String, index=True) # aws, azure, gcp
    type = Column(String) # ec2, s3, database, disk, ip, vnet etc
    region = Column(String)
    status = Column(String) # active, scaling, stopped, orphan
    details = Column(JSON) # arbitrary metadata (CPU, size, labels)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recommendations = relationship("Recommendation", back_populates="resource", cascade="all, delete-orphan")

class CostMetric(Base):
    __tablename__ = "cost_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    provider = Column(String, index=True)
    service = Column(String, index=True)
    region = Column(String)
    amount = Column(Float)
    currency = Column(String, default="USD")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_db_id = Column(Integer, ForeignKey("cloud_resources.id"))
    resource_id = Column(String, index=True) # external resource id
    current_state = Column(String) # e.g. "m5.2xlarge running <5% CPU"
    recommended_state = Column(String) # e.g. "m5.large (resize)"
    estimated_savings = Column(Float) # monthly cost savings
    ai_explanation = Column(String) # markdown text explanation
    risk_assessment = Column(String) # low, medium, high
    confidence_score = Column(Float) # 0.0 to 1.0
    status = Column(String, default="active") # active, approved, ignored, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resource = relationship("CloudResource", back_populates="recommendations")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    amount = Column(Float)
    provider = Column(String) # total, aws, azure, gcp
    threshold_percentage = Column(Float, default=80.0) # alert if spend > threshold%
    emails = Column(String) # comma-separated list
    slack_webhook = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question = Column(String)
    answer = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
