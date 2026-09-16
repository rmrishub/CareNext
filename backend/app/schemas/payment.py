from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.caregiver import CaregiverProfileResponse

class PaymentOrderCreateRequest(BaseModel):
    elderId: str
    caregiverId: str
    amount: float
    currency: Optional[str] = "INR"
    description: Optional[str] = "CareConnect Phase B Advance Deposit"

class PaymentOrderResponse(BaseModel):
    id: str
    familyId: str
    elderId: str
    caregiverId: str
    amount: float
    currency: str
    description: str
    gateway: str
    gatewayOrderId: Optional[str] = None
    status: str
    createdAt: Any
    updatedAt: Any
    caregiver: Optional[CaregiverProfileResponse] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class PaymentVerifyRequest(BaseModel):
    paymentOrderId: str
    gatewayTransactionId: str
    gatewaySignature: Optional[str] = None

class PaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    paymentOrderId: str
    status: str

