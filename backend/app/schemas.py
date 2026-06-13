# Pydantic Schemas for Request/Response validation
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# Auth schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Cost metrics schemas
class CostBreakdownResponse(BaseModel):
    date: date
    provider: str
    service: str
    amount: float
    region: str

class CostTrendResponse(BaseModel):
    total_cost: float
    trend: List[Dict[str, Any]]

# Recommendation schemas
class RecommendationResponse(BaseModel):
    id: int
    resource_id: str
    current_state: str
    recommended_state: str
    estimated_savings: float
    ai_explanation: str
    risk_assessment: str
    confidence_score: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class RecommendationUpdate(BaseModel):
    status: str # approved, ignored, completed

# Chat schemas
class ChatQueryRequest(BaseModel):
    message: str

class ChatQueryResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]]

# Budget schemas
class BudgetCreate(BaseModel):
    name: str
    amount: float
    provider: str
    threshold_percentage: float
    emails: str
    slack_webhook: Optional[str] = None

class BudgetResponse(BudgetCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
