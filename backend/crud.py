from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import time
from typing import List, Optional

async def get_products(db: AsyncIOMotorDatabase):
    cursor = db.products.find({}, {"_id": 0})
    return await cursor.to_list(length=None)

async def create_product(db: AsyncIOMotorDatabase, product_data: dict):
    if not product_data.get("id"):
        product_data["id"] = "PRD-" + str(int(time.time() * 1000))[-6:]
    product_data["createdAt"] = datetime.now()
    await db.products.insert_one(product_data)
    if "_id" in product_data:
        del product_data["_id"]
    return product_data

async def get_product_by_id(db: AsyncIOMotorDatabase, id: str):
    return await db.products.find_one({"id": id}, {"_id": 0})

async def update_product(db: AsyncIOMotorDatabase, id: str, product_data: dict):
    await db.products.update_one({"id": id}, {"$set": product_data})
    return await get_product_by_id(db, id)

async def delete_product(db: AsyncIOMotorDatabase, id: str):
    result = await db.products.delete_one({"id": id})
    return result.deleted_count > 0

async def get_categories(db: AsyncIOMotorDatabase):
    cursor = db.categories.find({}, {"_id": 0})
    return await cursor.to_list(length=None)

async def create_category(db: AsyncIOMotorDatabase, category_data: dict):
    category_data["createdAt"] = datetime.now()
    await db.categories.insert_one(category_data)
    if "_id" in category_data:
        del category_data["_id"]
    return category_data

async def get_sales(db: AsyncIOMotorDatabase):
    cursor = db.sales.find({}, {"_id": 0})
    return await cursor.to_list(length=None)

async def create_sale(db: AsyncIOMotorDatabase, sale_data: dict):
    if not sale_data.get("salesId"):
        sale_data["salesId"] = "SALE-" + str(int(time.time() * 1000))[-6:]
    sale_data["timestamp"] = datetime.now()
    sale_data["createdAt"] = datetime.now()
    await db.sales.insert_one(sale_data)
    if "_id" in sale_data:
        del sale_data["_id"]
    return sale_data

async def get_stock_history(db: AsyncIOMotorDatabase, product_id: str):
    cursor = db.stockhistory.find({"productId": product_id}, {"_id": 0}).sort("timestamp", -1).limit(50)
    return await cursor.to_list(length=None)

async def create_stock_history(db: AsyncIOMotorDatabase, history_data: dict):
    history_data["timestamp"] = datetime.now()
    history_data["createdAt"] = datetime.now()
    await db.stockhistory.insert_one(history_data)
    if "_id" in history_data:
        del history_data["_id"]
    return history_data

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str):
    return await db.users.find_one({"email": email}, {"_id": 0})

async def create_user(db: AsyncIOMotorDatabase, user_data: dict):
    user_data["createdAt"] = datetime.now()
    await db.users.insert_one(user_data)
    if "_id" in user_data:
        del user_data["_id"]
    return user_data
