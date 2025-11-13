from pydantic import BaseModel
from typing import Optional

class IssueAI(BaseModel):
    order: dict
    order_problem: str
    issue_type: str
    image: Optional[str] = None   