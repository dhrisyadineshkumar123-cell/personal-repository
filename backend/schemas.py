from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    fullName: str
    firstName: str
    lastName: str
    email: EmailStr
    role: str
    department: str
    phone: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    createdAt: datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    storeName: str
    storeType: str
    role: str
    password: str

class UserProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None

class UserPhotoUpdate(BaseModel):
    photo: str

class SettingsBase(BaseModel):
    storeName: str
    currency: str = "INR"
    lowThreshold: int = 7
    criticalThreshold: int = 3

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    createdAt: datetime

class ProductBase(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    quantity: int = 0
    price: float
    category: str
    stock: str = "optimal"

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    createdAt: datetime

class SaleBase(BaseModel):
    salesId: Optional[str] = None
    productId: str
    productName: str = ""
    quantity: int
    unitPrice: float
    totalAmount: float
    role: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class SaleResponse(SaleBase):
    timestamp: datetime
    createdAt: datetime

class StockHistoryBase(BaseModel):
    productId: str
    productName: Optional[str] = None
    type: str  # 'inflow', 'outflow'
    quantity: int

class StockHistoryCreate(StockHistoryBase):
    pass

class StockHistoryResponse(StockHistoryBase):
    timestamp: datetime
    createdAt: datetime
