from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database
from pages.auth import get_current_user
from typing import Dict, Any

router = APIRouter()

@router.post("/")
async def chat(data: Dict[str, Any] = Body(...), db: AsyncIOMotorDatabase = Depends(get_database), user: dict = Depends(get_current_user)):
    message = data.get('message', '').lower()
    page = data.get('page', '').lower()
    
    # Advanced Contextual Logic
    if "explain" in message or "what" in message and "this" in message:
        if "dashboard" in page or "nexus" in page:
            return {"reply": "This is the Nexus Command center. It provides a real-time matrix of your entire inventory, including KPI stats (Total Stock, Low Stock, etc.), live stock flow charts, and critical alerts."}
        if "categories" in page:
            return {"reply": "The Categories page allows you to organize your products into logical groups like Beverages, Dairy, or Electronics. You can create new categories or edit existing ones here."}
        if "sales" in page:
            return {"reply": "The Sales page tracks every transaction. It shows you what was sold, how much was earned, and allows you to filter history by date to analyze performance."}
        if "products" in page:
            return {"reply": "The Products page is your master inventory list. Here you can see detailed stock levels for every SKU, add new products, and monitor reorder points."}
        if "analytics" in page:
            return {"reply": "The Analytics page provides deep insights. It features predictive demand charts, category distribution pies, and inflow/outflow velocity graphs."}
        if "profile" in page:
            return {"reply": "This is your User Profile. You can manage your identity details, change your profile photo, and see your assigned role and department."}
        if "settings" in page:
            return {"reply": "The Settings page is where you configure global store rules, such as your currency, and set the thresholds for 'Low' and 'Critical' stock alerts."}

    # Inventory Logic
    if "products" in message or "inventory" in message or "items" in message:
        products = await db.products.find({}, {"_id": 0}).to_list(length=None)
        total_p = len(products)
        return {"reply": f"The SmartStock system is currently tracking {total_p} unique products. You can manage them in the 'Products' section."}
    
    # Alerts Logic
    if "low stock" in message or "alerts" in message or "problem" in message:
        low_stock = await db.products.find({"stock": "low"}, {"_id": 0}).to_list(length=None)
        critical = await db.products.find({"stock": "critical"}, {"_id": 0}).to_list(length=None)
        
        if not low_stock and not critical:
            return {"reply": "Great news! All stock levels are currently healthy and within optimal ranges."}
        
        resp = "I've detected some stock issues: "
        if critical:
            resp += f"{len(critical)} items are CRITICAL. "
        if low_stock:
            resp += f"{len(low_stock)} items are LOW. "
        resp += "Check the 'Active Alerts' panel on your dashboard for details."
        return {"reply": resp}
    
    # Financial Logic
    if "sales" in message or "revenue" in message or "money" in message or "earn" in message:
        sales = await db.sales.find({}, {"_id": 0}).to_list(length=None)
        total_v = sum(s.get('totalAmount', 0) for s in sales)
        return {"reply": f"Your total recorded sales revenue to date is ${total_v:,.2f}. You can see the full breakdown in the 'Sales' section."}

    # General Project Info
    if "how" in message and "work" in message:
        return {"reply": "SmartStock is a full-stack inventory management solution. The frontend (React) provides a high-tech UI, while this Python backend (FastAPI) manages your data securely in MongoDB. It uses real-time telemetry to help you avoid stockouts."}

    # Technical/Project Definitions Logic
    if "eoq" in message:
        return {"reply": "EOQ (Economic Order Quantity) is a formula used to determine the optimal order size that minimizes total inventory costs (ordering and holding costs). In this project, we use it to suggest the best 'Restock' amount for items in the 'Active Alerts' panel."}
    
    if "rop" in message or "roq" in message:
        return {"reply": "ROP (Reorder Point) is the specific level of stock at which a new order should be placed. When an item's quantity drops below its ROP, the system automatically triggers a 'Critical' or 'Low Stock' alert on your dashboard."}

    if "chart" in message or "graph" in message:
        return {"reply": "Our project features 3 main visualizations: 1. **Live Inventory Flow (Area Chart)**: Shows the velocity of 'Inflows' (restocking) vs 'Outflows' (sales) over time. 2. **Category Distribution (Donut Chart)**: Represents how much stock you have in each category using distinct colors. 3. **Capacity Projection (Bar/Line Chart)**: Compares actual stock volume against AI-predicted demand and maximum storage capacity."}

    if "inflow" in message or "outflow" in message:
        return {"reply": "'Inflow' represents stock entering your warehouse (restocking events), while 'Outflow' represents stock leaving due to sales. The system tracks these in the 'Stock History' to calculate turnover rates and demand patterns."}

    if "function" in message or "features" in message or "can you do" in message:
        return {"reply": "I can assist you with: 1. Explaining any page you're on. 2. Calculating total inventory value. 3. Listing low stock alerts. 4. Summarizing sales performance. 5. Navigating the system."}
        
    return {"reply": "I'm Nexus AI, your SmartStock assistant. I can explain the page you're looking at, give you stock counts, or check your sales. What would you like to know?"}
