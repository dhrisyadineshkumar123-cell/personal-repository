from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017")
DB_NAME = "smartstock"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]

async def get_database():
    return db
