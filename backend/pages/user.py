from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
import crud
from pages.auth import get_current_user
from schemas import UserProfileUpdate, UserPhotoUpdate

router = APIRouter()

@router.get("/profile")
async def get_profile(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    user_data = await crud.get_user_by_email(db, user['email'])
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_data

@router.put("/profile")
async def update_profile(data: UserProfileUpdate, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    user_email = user['email']
    update_data = data.dict(exclude_unset=True)
    
    if 'fullName' not in update_data and ('firstName' in update_data or 'lastName' in update_data):
        current_user = await crud.get_user_by_email(db, user_email)
        f_name = update_data.get('firstName', current_user.get('firstName', ''))
        l_name = update_data.get('lastName', current_user.get('lastName', ''))
        update_data['fullName'] = f"{f_name} {l_name}".strip()

    await db.users.update_one({"email": user_email}, {"$set": update_data})
    return {"message": "Profile updated successfully"}

@router.post("/photo")
async def update_photo(data: UserPhotoUpdate, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    await db.users.update_one({"email": user['email']}, {"$set": {"photo": data.photo}})
    return {"message": "Photo updated successfully"}
