from fastapi import APIRouter, Depends, HTTPException, Body, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
import crud
from pages.auth import get_current_user
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/api/stats")
async def get_stats(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    products = await crud.get_products(db)
    sales = await crud.get_sales(db)
    
    total_stock = sum(p.get('quantity', 0) for p in products)
    low_stock = sum(1 for p in products if p.get('stock') == 'low' or p.get('quantity', 0) <= 30)
    critical_stock = sum(1 for p in products if p.get('stock') == 'critical' or p.get('quantity', 0) <= 10)
    total_sales_value = sum(s.get('totalAmount', 0) for s in sales)
    
    # Matching frontend expectations in StatsGrid.tsx
    return {
        "totalProducts": len(products),
        "totalStock": total_stock,
        "lowStock": low_stock,
        "criticalStock": critical_stock,
        "totalSales": total_sales_value,
        "totalSalesValue": total_sales_value,
        "turnoverRate": round(len(sales) / len(products), 2) if products else 0
    }

@router.get("/api/alerts")
async def get_alerts(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    products = await crud.get_products(db)
    alerts = []
    for p in products:
        qty = p.get('quantity', 0)
        # Mock calculation for EOQ and ROP
        rop = 30 # Reorder point
        eoq = 50 # Economic order quantity
        
        if p.get('stock') == 'critical' or qty <= 10:
            alerts.append({
                "id": p.get('id'),
                "productId": p.get('id'),
                "productName": p.get('name'),
                "type": "Critical Stock",
                "severity": "high",
                "message": f"{p.get('name')} is critically low ({qty} left)",
                "currentStock": qty,
                "rop": rop,
                "eoq": eoq,
                "time": datetime.now().isoformat()
            })
        elif p.get('stock') == 'low' or qty <= 30:
            alerts.append({
                "id": p.get('id'),
                "productId": p.get('id'),
                "productName": p.get('name'),
                "type": "Low Stock",
                "severity": "medium",
                "message": f"{p.get('name')} is running low ({qty} left)",
                "currentStock": qty,
                "rop": rop,
                "eoq": eoq,
                "time": datetime.now().isoformat()
            })
    return alerts

@router.post("/api/restock")
async def restock_product(data: Dict[str, Any] = Body(...), db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    product_id = data.get('productId')
    quantity = data.get('quantity')
    if not product_id or not quantity:
        raise HTTPException(status_code=400, detail="Missing productId or quantity")
    
    product = await crud.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    new_qty = product['quantity'] + quantity
    await crud.update_product(db, product_id, {"quantity": new_qty})
    
    await crud.create_stock_history(db, {
        "productId": product_id,
        "productName": product['name'],
        "type": "inflow",
        "quantity": quantity
    })
    
    return {"message": "Restocked successfully", "new_quantity": new_qty}

@router.get("/api/charts/flow")
async def get_chart_flow(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    # Providing mock data as requested by frontend components
    return [
        {"time": "09:00", "inflow": 40, "outflow": 24},
        {"time": "10:00", "inflow": 30, "outflow": 13},
        {"time": "11:00", "inflow": 20, "outflow": 58},
        {"time": "12:00", "inflow": 27, "outflow": 39},
        {"time": "13:00", "inflow": 18, "outflow": 48},
        {"time": "14:00", "inflow": 23, "outflow": 38},
        {"time": "15:00", "inflow": 34, "outflow": 43},
    ]

@router.get("/api/charts/projections")
async def get_chart_projections(db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    return [
        {"month": "Jan", "actual": 400, "projected": 450},
        {"month": "Feb", "actual": 300, "projected": 320},
        {"month": "Mar", "actual": 200, "projected": 210},
        {"month": "Apr", "actual": 278, "projected": 300},
        {"month": "May", "actual": 189, "projected": 200},
        {"month": "Jun", "actual": 239, "projected": 250},
    ]

@router.get("/api/charts/categories")
async def get_chart_categories(category: str = Query("all"), db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    products = await crud.get_products(db)
    dist = {}
    for p in products:
        cat = p.get('category', 'Uncategorized')
        dist[cat] = dist.get(cat, 0) + p.get('quantity', 0)
    
    # Predefined high-contrast neon colors for categories
    colors = [
        "#8b5cf6", # Purple
        "#10b981", # Emerald
        "#3b82f6", # Blue
        "#f59e0b", # Amber
        "#ef4444", # Red
        "#ec4899", # Pink
        "#06b6d4", # Cyan
        "#f97316", # Orange
        "#84cc16", # Lime
        "#a855f7", # Violet
    ]
    
    result = []
    for i, (name, value) in enumerate(dist.items()):
        result.append({
            "name": name,
            "value": value,
            "color": colors[i % len(colors)]
        })
    
    return result
