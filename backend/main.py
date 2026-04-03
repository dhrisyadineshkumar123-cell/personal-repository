from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from database import get_database
from seed_data import seed_all
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
import asyncio

# Import routers from pages
from pages.auth import router as auth_router
from pages.products import router as products_router
from pages.categories import router as categories_router
from pages.sales import router as sales_router
from pages.analytics import router as analytics_router
from pages.chatbot import router as chatbot_router
from pages.user import router as user_router
from pages.settings import router as settings_router

app = FastAPI(title="Smart Stock API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database startup and seeding
@app.on_event("startup")
async def startup_db_client():
    try:
        db = await get_database()
        # Adding a timeout to seeding to prevent startup hang if MongoDB is offline
        await asyncio.wait_for(seed_all(db), timeout=5.0)
        print("✅ Database initialized and seeded")
    except asyncio.TimeoutError:
        print("⚠️ Database seeding timed out - check if MongoDB is running")
    except Exception as e:
        print(f"❌ Database error during startup: {str(e)}")

# Register routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products_router, tags=["Products"])
app.include_router(categories_router, tags=["Categories"])
app.include_router(sales_router, tags=["Sales"])
app.include_router(analytics_router, tags=["Analytics"])
app.include_router(chatbot_router, prefix="/api/chat", tags=["Chatbot"])
app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(settings_router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Stock API", "status": "online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
