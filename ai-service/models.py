from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class Payment(BaseModel):
    method: Optional[str] = None
    transactionId: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "USD"
    paid: Optional[bool] = None


class Order(BaseModel):
    userId: str
    name: str
    address: str
    phone: str
    email: Optional[str] = None
    status: str = "processing"
    urgency: str = "medium"
    payment: Optional[Payment] = None
    items: List[Dict[str, Any]] = []   # matches { type: Array }
    isPackage: bool = False
    timestamp: Optional[str] = None    # ISO string


class OrderIssueRequest(BaseModel):
    order: Order
    order_problem: str
    issue_type: str
    image: Optional[str] = None   # Base64 string or null


class OrderDecisionResponse(BaseModel):
    decision: str
    reason: str
    polite_message: str
    internal_notes: Optional[str] = ""
    fraud_flag: bool = False
    fraud_risk_level: str = "low"