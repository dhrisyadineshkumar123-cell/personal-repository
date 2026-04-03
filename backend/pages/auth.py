from fastapi import APIRouter, Request, HTTPException, Depends, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
import crud
from schemas import LoginRequest, RegisterRequest

router = APIRouter()

@router.post("/login")
async def login(data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await crud.get_user_by_email(db, data.email)
    if not user or user.get('password') != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials. Systems locked.")
    
    return {
        "email": user['email'],
        "role": user.get('role', 'staff'),
        "fullName": user.get('fullName', '')
    }

@router.post("/register")
async def register(data: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing_user = await crud.get_user_by_email(db, data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = data.dict()
    # Ensure all user profile fields are initialized
    user_dict['firstName'] = data.fullName.split(' ')[0] if ' ' in data.fullName else data.fullName
    user_dict['lastName'] = ' '.join(data.fullName.split(' ')[1:]) if ' ' in data.fullName else ''
    user_dict['phone'] = ""
    user_dict['department'] = "Operations"
    user_dict['photo'] = None
    
    new_user = await crud.create_user(db, user_dict)
    return {"message": "Account created successfully", "user": new_user}

@router.post("/forgot-password")
async def forgot_password(data: dict = Body(...)):
    email = data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Mock behavior
    return {"message": "Recovery sequence initiated. Check your encrypted link."}

async def get_current_user(request: Request, db: AsyncIOMotorDatabase = Depends(get_database)):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header[7:]
    
    # Priority 1: Check if token is a registered email
    user = await crud.get_user_by_email(db, token)
    if user:
        return user
        
    # Priority 2: Check if token is a mock role
    if token in ['admin', 'staff']:
        return {
            "email": "admin@smartstock.com" if token == 'admin' else "staff@smartstock.com",
            "role": token
        }
        
    raise HTTPException(status_code=401, detail="Invalid token")

async def admin_required(user: dict = Depends(get_current_user)):
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
    return user
