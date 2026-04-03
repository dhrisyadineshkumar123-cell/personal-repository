from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
import crud
from pages.auth import get_current_user
from typing import List
from schemas import CategoryCreate, CategoryResponse

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    return await crud.get_categories(db)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    category_dict = category.dict()
    return await crud.create_category(db, category_dict)

@router.put("/categories/{name}", response_model=CategoryResponse)
async def update_category(name: str, category: CategoryCreate, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    # Check if user is admin
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
        
    result = await db.categories.find_one_and_update(
        {"name": name},
        {"$set": category.dict()},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    if "_id" in result:
        del result["_id"]
    return result

@router.delete("/categories/{name}")
async def delete_category(name: str, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    # Check if user is admin
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin only")
        
    result = await db.categories.delete_one({"name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}
