# AI FinOps Copilot Chat API Router
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatQueryRequest, ChatQueryResponse
from app.services.ai_service import ai_service
from app.models import ChatHistory

router = APIRouter()

@router.post("/", response_model=ChatQueryResponse)
def ask_copilot(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db)
):
    """Ask natural language FinOps and AWS infrastructure questions to the CloudWise AI Copilot."""
    res = ai_service.answer_finops_query(query=payload.message, db=db)
    
    # Save chat history
    try:
        history_entry = ChatHistory(
            question=payload.message,
            answer=res.get("response", "")
        )
        db.add(history_entry)
        db.commit()
    except Exception:
        pass
        
    return ChatQueryResponse(
        response=res.get("response", ""),
        sources=res.get("sources", [])
    )
