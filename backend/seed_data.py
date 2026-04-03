from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

async def seed_all(db: AsyncIOMotorDatabase):
    # Seed users
    if await db.users.count_documents({}) == 0:
        await db.users.insert_many([
            {
                "fullName": "Sarah Miller",
                "firstName": "Sarah",
                "lastName": "Miller",
                "email": "admin@smartstock.com",
                "password": "admin123",
                "role": "admin",
                "department": "Operations",
                "phone": "+1 (555) 123-4567",
                "createdAt": datetime.now()
            },
            {
                "fullName": "John Doe",
                "firstName": "John",
                "lastName": "Doe",
                "email": "staff@smartstock.com",
                "password": "staff123",
                "role": "staff",
                "department": "Floor Operations",
                "phone": "+1 (555) 987-6543",
                "createdAt": datetime.now()
            }
        ])
        print('✅ Users seeded')

    # Seed categories
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many([
            {"name": 'Beverages', "description": 'Drinks and liquids', "createdAt": datetime.now()},
            {"name": 'Dairy', "description": 'Milk products', "createdAt": datetime.now()},
            {"name": 'Produce', "description": 'Fruits and vegetables', "createdAt": datetime.now()},
            {"name": 'Bakery', "description": 'Bread and pastries', "createdAt": datetime.now()},
            {"name": 'Electronics', "description": 'Gadgets', "createdAt": datetime.now()}
        ])
        print('✅ Categories seeded')

    # Seed products
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([
            {"id": 'PRD001', "name": 'Coffee Beans', "description": 'Premium arabica', "quantity": 150, "price": 12.99, "category": 'Beverages', "stock": 'optimal', "createdAt": datetime.now()},
            {"id": 'PRD002', "name": 'Whole Milk', "description": '1L organic', "quantity": 25, "price": 3.49, "category": 'Dairy', "stock": 'low', "createdAt": datetime.now()},
            {"id": 'PRD003', "name": 'Apples', "description": 'Organic gala', "quantity": 80, "price": 1.99, "category": 'Produce', "stock": 'optimal', "createdAt": datetime.now()},
            {"id": 'PRD004', "name": 'Sliced Bread', "description": 'Whole wheat loaf', "quantity": 200, "price": 2.29, "category": 'Bakery', "stock": 'overstock', "createdAt": datetime.now()},
            {"id": 'PRD005', "name": 'Smartphone', "description": 'Latest model', "quantity": 5, "price": 599.99, "category": 'Electronics', "stock": 'critical', "createdAt": datetime.now()},
            {"id": 'PRD006', "name": 'Orange Juice', "description": 'Fresh squeezed 1L', "quantity": 35, "price": 4.99, "category": 'Beverages', "stock": 'low', "createdAt": datetime.now()}
        ])
        print('✅ Products seeded')

    # Seed settings
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one({
            "storeName": "Smart Stock",
            "currency": "INR",
            "lowThreshold": 7,
            "criticalThreshold": 3
        })
        print('✅ Settings seeded')
