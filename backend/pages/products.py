from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
import crud
from pages.auth import get_current_user
from typing import List
from schemas import ProductCreate, ProductResponse, StockHistoryResponse

router = APIRouter()

@router.get("/products", response_model=List[ProductResponse])
async def get_products(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    return await crud.get_products(db)

@router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    product_dict = product.dict()
    return await crud.create_product(db, product_dict)

@router.get("/products/{id}", response_model=ProductResponse)
async def get_product(id: str, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    product = await crud.get_product_by_id(db, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{id}", response_model=ProductResponse)
async def update_product(id: str, product_data: dict = Body(...), db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    updated = await crud.update_product(db, id, product_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

@router.delete("/products/{id}")
async def delete_product(id: str, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    deleted = await crud.delete_product(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Deleted"}

@router.get("/products/{id}/flow", response_model=List[StockHistoryResponse])
async def get_product_flow(id: str, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    return await crud.get_stock_history(db, id)
