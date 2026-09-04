# Pydantic Schemas for Request/Response validation
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# Auth schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Cloud Resource schemas
class CloudResourceResponse(BaseModel):
    id: int
    resource_id: str
    name: str
    provider: str
    type: str
    region: str
    status: str
    estimated_monthly_cost: float
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Cost metrics schemas
class CostBreakdownResponse(BaseModel):
    date: date
    provider: str
    service: str
    amount: float
    region: str

    model_config = ConfigDict(from_attributes=True)

class CostSummaryResponse(BaseModel):
    total_monthly_spend: float
    projected_savings: float
    active_resources_count: int
    spend_change_percentage: float
    daily_trends: List[Dict[str, Any]]
    service_breakdown: List[Dict[str, Any]]
    regional_breakdown: List[Dict[str, Any]]

# Recommendation schemas
class RecommendationResponse(BaseModel):
    id: int
    resource_id: str
    resource_name: Optional[str] = None
    service_type: str
    action_type: str
    current_state: str
    recommended_state: str
    estimated_savings: float
    ai_explanation: str
    risk_assessment: str
    confidence_score: float
    status: str
    remediated_at: Optional[datetime] = None
    remediation_log: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RecommendationUpdate(BaseModel):
    status: str # approved, dismissed, remediated

class RemediateRequest(BaseModel):
    create_backup: bool = True

class RemediateResponse(BaseModel):
    success: bool
    status: str
    message: str
    remediation_log: str

# Chat schemas
class ChatQueryRequest(BaseModel):
    message: str

class ChatQueryResponse(BaseModel):
    response: str
    sources: Optional[List[Dict[str, Any]]] = None

# Budget schemas
class BudgetCreate(BaseModel):
    name: str
    amount: float
    provider: str = "aws"
    threshold_percentage: float = 80.0
    emails: str
    slack_webhook: Optional[str] = None

class BudgetResponse(BudgetCreate):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# AWS Status schemas
class AWSStatusResponse(BaseModel):
    connected: bool
    account_id: Optional[str] = None
    region: str
    identity_arn: Optional[str] = None
    mode: str
    resource_counts: Dict[str, int]
    last_synced_at: Optional[datetime] = None

class AWSCredentialsUpdate(BaseModel):
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_default_region: str = "us-east-1"
    aws_session_token: Optional[str] = None
