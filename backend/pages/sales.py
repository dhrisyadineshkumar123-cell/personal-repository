from fastapi import APIRouter, Depends, HTTPException, Body, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
import crud
from pages.auth import get_current_user
from typing import List, Optional
from schemas import SaleCreate, SaleResponse
from datetime import datetime

router = APIRouter()

@router.get("/api/sales", response_model=List[SaleResponse])
@router.get("/sales", response_model=List[SaleResponse])
async def get_sales(
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    db: AsyncIOMotorDatabase = Depends(get_database), 
    user: dict = Depends(get_current_user)
):
    query = {}
    if from_date or to_date:
        query["timestamp"] = {}
        if from_date:
            try:
                # Handle YYYY-MM-DD or full ISO strings
                dt = datetime.fromisoformat(from_date.replace("Z", "+00:00"))
                query["timestamp"]["$gte"] = dt
            except ValueError:
                # Fallback for simple YYYY-MM-DD
                query["timestamp"]["$gte"] = datetime.strptime(from_date[:10], "%Y-%m-%d")
        if to_date:
            try:
                # Set to end of the day to include all sales on that date
                end_dt = datetime.fromisoformat(to_date.replace("Z", "+00:00"))
                if len(to_date) <= 10: # If only date provided (YYYY-MM-DD)
                    end_dt = end_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
                query["timestamp"]["$lte"] = end_dt
            except ValueError:
                # Fallback for simple YYYY-MM-DD
                end_dt = datetime.strptime(to_date[:10], "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999)
                query["timestamp"]["$lte"] = end_dt
    
    cursor = db.sales.find(query, {"_id": 0}).sort("timestamp", -1)
    return await cursor.to_list(length=None)

@router.post("/api/sales", response_model=SaleResponse)
@router.post("/sales", response_model=SaleResponse)
async def create_sale(sale: SaleCreate, db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    sale_dict = sale.dict()
    # Also update product quantity and create stock history
    product = await crud.get_product_by_id(db, sale_dict['productId'])
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    new_qty = product['quantity'] - sale_dict['quantity']
    if new_qty < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    await crud.update_product(db, product['id'], {"quantity": new_qty})
    
    await crud.create_stock_history(db, {
        "productId": product['id'],
        "productName": product['name'],
        "type": "outflow",
        "quantity": sale_dict['quantity']
    })
    
    # Add role from user if not provided
    if not sale_dict.get('role'):
        sale_dict['role'] = user.get('role', 'staff')
        
    return await crud.create_sale(db, sale_dict)
