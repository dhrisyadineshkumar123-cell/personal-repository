from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
from pages.auth import get_current_user
from schemas import SettingsBase

router = APIRouter()

@router.get("/")
async def get_settings(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        # Default settings if none exist
        return {
            "storeName": "Smart Stock",
            "currency": "INR",
            "lowThreshold": 7,
            "criticalThreshold": 3
        }
    return settings

@router.put("/")
async def update_settings(data: SettingsBase, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    settings_dict = data.dict()
    # We'll just have one global settings document for now
    await db.settings.update_one({}, {"$set": settings_dict}, upsert=True)
    return {"message": "Settings updated successfully"}
