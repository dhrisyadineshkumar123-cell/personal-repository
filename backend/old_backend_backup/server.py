from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime, timedelta
import time
import math

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client.smartstock

# Collections
products_col = db.products
categories_col = db.categories
sales_col = db.sales
history_col = db.stockhistory
users_col = db.users

# Auth Middleware
def auth_required(f):
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Unauthorized"}), 401
        
        token = auth_header[7:]
        
        # Priority 1: Check if token is a registered email
        user = users_col.find_one({"email": token})
        if user:
            request.user_email = token
            request.role = user.get('role', 'admin') # Default to admin for registered users in this demo
            return f(*args, **kwargs)
            
        # Priority 2: Check if token is a mock role
        if token in ['admin', 'staff']:
            request.role = token
            request.user_email = "admin@smartstock.com" if token == 'admin' else "staff@smartstock.com"
            return f(*args, **kwargs)
            
        return jsonify({"error": "Invalid token"}), 401
    decorated_function.__name__ = f.__name__
    return decorated_function

def admin_required(f):
    def decorated_function(*args, **kwargs):
        if getattr(request, 'role', None) != 'admin':
            return jsonify({"error": "Admin only"}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Seed Data
def seed_data():
    try:
        # Seed users
        if users_col.count_documents({}) == 0:
            users_col.insert_many([
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
        if categories_col.count_documents({}) == 0:
            categories_col.insert_many([
                {"name": 'Beverages', "description": 'Drinks and liquids', "createdAt": datetime.now()},
                {"name": 'Dairy', "description": 'Milk products', "createdAt": datetime.now()},
                {"name": 'Produce', "description": 'Fruits and vegetables', "createdAt": datetime.now()},
                {"name": 'Bakery', "description": 'Bread and pastries', "createdAt": datetime.now()},
                {"name": 'Electronics', "description": 'Gadgets', "createdAt": datetime.now()}
            ])
            print('✅ Categories seeded')

        # Seed products
        if products_col.count_documents({}) == 0:
            products_col.insert_many([
                {"id": 'PRD001', "name": 'Coffee Beans', "description": 'Premium arabica', "quantity": 150, "price": 12.99, "category": 'Beverages', "stock": 'optimal', "createdAt": datetime.now()},
                {"id": 'PRD002', "name": 'Whole Milk', "description": '1L organic', "quantity": 25, "price": 3.49, "category": 'Dairy', "stock": 'low', "createdAt": datetime.now()},
                {"id": 'PRD003', "name": 'Apples', "description": 'Organic gala', "quantity": 80, "price": 1.99, "category": 'Produce', "stock": 'optimal', "createdAt": datetime.now()},
                {"id": 'PRD004', "name": 'Sliced Bread', "description": 'Whole wheat loaf', "quantity": 200, "price": 2.29, "category": 'Bakery', "stock": 'overstock', "createdAt": datetime.now()},
                {"id": 'PRD005', "name": 'Smartphone', "description": 'Latest model', "quantity": 5, "price": 599.99, "category": 'Electronics', "stock": 'critical', "createdAt": datetime.now()},
                {"id": 'PRD006', "name": 'Orange Juice', "description": 'Fresh squeezed 1L', "quantity": 35, "price": 4.99, "category": 'Beverages', "stock": 'low', "createdAt": datetime.now()}
            ])
            print('✅ Products seeded')
    except Exception as e:
        print('Seed error:', str(e))

# Routes - /products
@app.route('/products', methods=['GET'])
@auth_required
def get_products():
    try:
        data = list(products_col.find({}, {'_id': 0}))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/products', methods=['POST'])
@auth_required
def create_product():
    try:
        product_data = request.json
        new_id = product_data.get('id') or 'PRD-' + str(int(time.time() * 1000))[-6:]
        product_data['id'] = new_id
        product_data['createdAt'] = datetime.now()
        products_col.insert_one(product_data)
        del product_data['_id']
        return jsonify(product_data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/products/<id>', methods=['GET'])
@auth_required
def get_product(id):
    try:
        product = products_col.find_one({"id": id}, {'_id': 0})
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/products/<id>', methods=['PUT'])
@auth_required
def update_product(id):
    try:
        product_data = request.json
        updated = products_col.find_one_and_update(
            {"id": id},
            {"$set": product_data},
            return_document=True,
            projection={'_id': 0}
        )
        if not updated:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/products/<id>', methods=['DELETE'])
@auth_required
def delete_product(id):
    try:
        deleted = products_col.find_one_and_delete({"id": id})
        if not deleted:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/products/<id>/flow', methods=['GET'])
@auth_required
def get_product_flow(id):
    try:
        history = list(history_col.find({"productId": id}).sort("timestamp", DESCENDING).limit(50))
        flows = [{
            "type": h["type"],
            "quantity": h["quantity"],
            "date": h["timestamp"].isoformat()
        } for h in history]
        return jsonify(flows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Categories Routes
@app.route('/categories', methods=['GET'])
@auth_required
def get_categories():
    try:
        data = list(categories_col.find({}, {'_id': 0}))
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/categories', methods=['POST'])
@auth_required
@admin_required
def create_category():
    try:
        cat_data = request.json
        cat_data['createdAt'] = datetime.now()
        categories_col.insert_one(cat_data)
        del cat_data['_id']
        return jsonify(cat_data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/categories/<name>', methods=['PUT'])
@auth_required
@admin_required
def update_category(name):
    try:
        cat_data = request.json
        updated = categories_col.find_one_and_update(
            {"name": name},
            {"$set": cat_data},
            return_document=True,
            projection={'_id': 0}
        )
        if not updated:
            return jsonify({"error": "Category not found"}), 404
        return jsonify(updated)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/categories/<name>', methods=['DELETE'])
@auth_required
@admin_required
def delete_category(name):
    try:
        categories_col.delete_one({"name": name})
        return jsonify({"message": "Deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Sales Routes
def handle_get_sales():
    try:
        from_date = request.args.get('from')
        to_date = request.args.get('to')
        filter_query = {}
        if from_date or to_date:
            filter_query['timestamp'] = {}
            if from_date:
                filter_query['timestamp']['$gte'] = datetime.fromisoformat(from_date)
            if to_date:
                toDateObj = datetime.fromisoformat(to_date).replace(hour=23, minute=59, second=59, microsecond=999)
                filter_query['timestamp']['$lte'] = toDateObj
        
        data = list(sales_col.find(filter_query).sort("timestamp", DESCENDING).limit(200))
        for s in data:
            del s['_id']
            s['timestamp'] = s['timestamp'].isoformat()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def handle_post_sale():
    try:
        body = request.json
        product_id = body.get('productId')
        quantity = body.get('quantity')
        unit_price = body.get('unitPrice')

        if not product_id or quantity is None or unit_price is None:
            return jsonify({"error": "productId, quantity, and unitPrice are required"}), 400

        qty = float(quantity)
        price = float(unit_price)

        if qty <= 0 or price <= 0:
            return jsonify({"error": "quantity and unitPrice must be positive"}), 400

        product = products_col.find_one({"id": product_id})
        if not product:
            return jsonify({"error": f"Product '{product_id}' not found"}), 404
        
        if product['quantity'] < qty:
            return jsonify({"error": f"Insufficient stock. Available: {product['quantity']}, requested: {qty}"}), 400

        total_amount = qty * price
        sales_id = 'SALE-' + str(int(time.time() * 1000))[-8:]
        
        sale = {
            **body,
            "salesId": sales_id,
            "quantity": qty,
            "unitPrice": price,
            "totalAmount": total_amount,
            "role": request.role,
            "timestamp": datetime.now(),
            "createdAt": datetime.now()
        }
        sales_col.insert_one(sale)
        del sale['_id']
        sale['timestamp'] = sale['timestamp'].isoformat()

        # Update product stock
        new_qty = product['quantity'] - qty
        stock_status = 'optimal'
        if new_qty == 0 or new_qty <= 10: stock_status = 'critical'
        elif new_qty <= 30: stock_status = 'low'
        
        products_col.update_one({"id": product_id}, {"$set": {"quantity": new_qty, "stock": stock_status}})

        # Record history
        history_col.insert_one({
            "productId": product['id'],
            "productName": product['name'],
            "type": 'outflow',
            "quantity": qty,
            "timestamp": datetime.now()
        })

        return jsonify({"sale": sale, "updatedStock": new_qty}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/sales', methods=['GET', 'POST'])
@auth_required
def sales_route():
    if request.method == 'GET': return handle_get_sales()
    return handle_post_sale()

@app.route('/api/sales', methods=['GET', 'POST'])
@auth_required
def api_sales_route():
    if request.method == 'GET': return handle_get_sales()
    return handle_post_sale()

# Charts API
@app.route('/api/charts/categories', methods=['GET'])
@auth_required
def get_chart_categories():
    try:
        colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#f43f5e', '#84cc16']
        all_categories = list(categories_col.find({}, {"name": 1, "_id": 0}))
        
        pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}}}]
        product_counts = list(products_col.aggregate(pipeline))
        count_map = {p['_id']: p['count'] for p in product_counts}

        chart_data = []
        for i, cat in enumerate(all_categories):
            chart_data.append({
                "name": cat['name'],
                "value": count_map.get(cat['name'], 0),
                "color": colors[i % len(colors)]
            })

        for p in product_counts:
            if p['_id'] and not any(c['name'] == p['_id'] for c in all_categories):
                chart_data.append({
                    "name": p['_id'],
                    "value": p['count'],
                    "color": colors[len(chart_data) % len(colors)]
                })

        if not chart_data:
            return jsonify([{"name": 'No Categories', "value": 1, "color": '#64748b'}])

        return jsonify(chart_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
@auth_required
def get_stats():
    try:
        total_products = products_col.count_documents({})
        low_stock = products_col.count_documents({"stock": {"$in": ['low', 'critical']}})
        
        categories_agg = list(products_col.aggregate([{"$group": {"_id": "$category", "count": {"$sum": 1}} }]))
        stock_status_agg = list(products_col.aggregate([{"$group": {"_id": "$stock", "count": {"$sum": 1}} }]))
        total_sales_agg = list(sales_col.aggregate([{"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}]))
        
        total_sales = total_sales_agg[0]['total'] if total_sales_agg else 0
        
        avg_inv_agg = list(products_col.aggregate([{"$group": {"_id": None, "avg": {"$avg": {"$multiply": ["$quantity", "$price"]}}}}]))
        avg_inv = avg_inv_agg[0]['avg'] if avg_inv_agg else 0
        turnover = round(total_sales / avg_inv, 2) if avg_inv > 0 else 0

        return jsonify({
            "totalProducts": total_products,
            "lowStock": low_stock,
            "categories": categories_agg,
            "stockStatusBreakdown": stock_status_agg,
            "totalSales": total_sales,
            "turnoverRate": turnover
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/charts/flow', methods=['GET'])
@auth_required
def get_chart_flow():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "inflow": {"$sum": {"$cond": [{"$eq": ["$type", "inflow"]}, "$quantity", 0]}},
                    "outflow": {"$sum": {"$cond": [{"$eq": ["$type", "outflow"]}, "$quantity", 0]}}
                }
            },
            {"$sort": {"_id": 1}},
            {"$limit": 14}
        ]
        history = list(history_col.aggregate(pipeline))
        flows = [{"time": h["_id"], "inflow": h["inflow"], "outflow": h["outflow"]} for h in history]

        if not flows:
            return jsonify([
                {"time": 'Yesterday', "inflow": 0, "outflow": 0},
                {"time": 'Today', "inflow": 0, "outflow": 0}
            ])

        return jsonify(flows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/charts/projections', methods=['GET'])
@auth_required
def get_chart_projections():
    projections = [
        {"name": 'Mon', "actual": 85, "projected": 90, "capacity": 100},
        {"name": 'Tue', "actual": 92, "projected": 88, "capacity": 100},
        {"name": 'Wed', "actual": 78, "projected": 95, "capacity": 100},
        {"name": 'Thu', "actual": 95, "projected": 92, "capacity": 100},
        {"name": 'Fri', "actual": 88, "projected": 98, "capacity": 100},
        {"name": 'Sat', "actual": 102, "projected": 85, "capacity": 100},
        {"name": 'Sun', "actual": 0, "projected": 75, "capacity": 100}
    ]
    return jsonify(projections)

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = str(data.get('password'))
        
        user = users_col.find_one({"email": email})
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
            
        if str(user.get('password')) != password:
            return jsonify({"error": "Invalid email or password"}), 401
            
        # Return user info (role, email) for the frontend
        return jsonify({
            "email": user['email'],
            "role": user.get('role', 'staff'),
            "fullName": user.get('fullName', 'User')
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# User/Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        if users_col.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 400
        
        full_name = data.get('fullName', '')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = {
            "fullName": full_name,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "storeName": data.get('storeName'),
            "storeType": data.get('storeType'),
            "password": str(data.get('password')), # Ensure string for login check
            "role": data.get('role', 'admin'), # Use role from request or default to admin
            "department": "Operations",
            "phone": "",
            "createdAt": datetime.now()
        }
        users_col.insert_one(user)
        return jsonify({"message": "Account created"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email')
        new_password = str(data.get('password'))
        
        # Check if user exists first
        user = users_col.find_one({"email": email})
        if not user:
            return jsonify({"error": "User with this email does not exist."}), 404
            
        result = users_col.update_one({"email": email}, {"$set": {"password": new_password}})
        return jsonify({"message": "Password updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/user/profile', methods=['GET'])
@auth_required
def get_profile():
    try:
        email = getattr(request, 'user_email', None)
        if not email:
            # Fallback for mock roles
            email = "admin@smartstock.com" if request.role == 'admin' else "staff@smartstock.com"
            
        user = users_col.find_one({"email": email}, {'_id': 0, 'password': 0})
        if not user:
            # Return a default if not in DB yet
            return jsonify({
                "firstName": "Sarah" if request.role == 'admin' else "John",
                "lastName": "Miller" if request.role == 'admin' else "Doe",
                "email": email,
                "role": "System Administrator" if request.role == 'admin' else "Floor Staff",
                "department": "Operations",
                "phone": "+1 (555) 123-4567"
            })
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
@auth_required
def update_profile():
    try:
        email = getattr(request, 'user_email', None)
        if not email:
            email = "admin@smartstock.com" if request.role == 'admin' else "staff@smartstock.com"
            
        data = request.json
        users_col.update_one({"email": email}, {"$set": data}, upsert=True)
        return jsonify({"message": "Profile updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/user/photo', methods=['POST'])
@auth_required
def upload_photo():
    try:
        email = getattr(request, 'user_email', None)
        if not email:
            email = "admin@smartstock.com" if request.role == 'admin' else "staff@smartstock.com"
            
        data = request.json
        photo_url = data.get('photo') # Base64 string
        users_col.update_one({"email": email}, {"$set": {"photo": photo_url}}, upsert=True)
        return jsonify({"message": "Photo uploaded"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/settings', methods=['GET'])
@auth_required
def get_settings():
    try:
        email = getattr(request, 'user_email', None)
        user = users_col.find_one({"email": email}, {"settings": 1, "storeName": 1, "_id": 0})
        if not user:
            return jsonify({"storeName": "SmartStock Demo Store", "currency": "INR", "lowThreshold": 7, "criticalThreshold": 3})
        
        settings = user.get('settings', {
            "storeName": user.get('storeName', "SmartStock Demo Store"),
            "currency": "INR",
            "lowThreshold": 7,
            "criticalThreshold": 3
        })
        return jsonify(settings)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['PUT'])
@auth_required
def update_settings():
    try:
        email = getattr(request, 'user_email', None)
        data = request.json
        users_col.update_one({"email": email}, {"$set": {"settings": data, "storeName": data.get('storeName')}}, upsert=True)
        return jsonify({"message": "Settings updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/chat', methods=['POST'])
@auth_required
def ai_chat():
    try:
        body = request.json
        message = body.get('message', '').lower()
        role = getattr(request, 'role', 'staff')
        
        # Comprehensive Knowledge Base
        knowledge = {
            "eoq": "EOQ (Economic Order Quantity) minimizes total inventory costs. Formula: sqrt((2 * Annual Demand * Order Cost) / Holding Cost). Our system automates this to suggest optimal restock sizes.",
            "rop": "ROP (Reorder Point) is the inventory level that triggers a new order. It's calculated based on lead time demand and safety stock to prevent stockouts.",
            "features": "SmartStock Features: 1. Nexus Command (Unified Dashboard), 2. Live Inventory Flow Tracking, 3. Automated ROP/EOQ Alerts, 4. Sales Ledger & Analytics, 5. Multi-role Access Control, 6. Base64 Profile Photo Management.",
            "charts": "Visualizations: 1. Area Charts (Inventory Flow), 2. Pie/Donut Charts (Category Mix), 3. Bar Charts (Demand Projections). View them on the Dashboard or Analytics page.",
            "donuts": "The Donut/Pie charts on the Dashboard show the 'Category Stock Distribution'. It helps you see which product categories occupy the most space in your inventory.",
            "donut": "The Donut/Pie charts on the Dashboard show the 'Category Stock Distribution'. It helps you see which product categories occupy the most space in your inventory.",
            "analysis": "The Analytics page provides deep insights into demand trends, stock turnover rates, and month-over-month received vs demanded quantities.",
            "diagrams": "Our diagrams include live telemetry graphs that sync every 12ms to show real-time inflow and outflow of products.",
            "diagram": "Our diagrams include live telemetry graphs that sync every 12ms to show real-time inflow and outflow of products.",
            "admin": "Admin functions include: Category management, Full sales ledger access, User profile overrides, and System-wide telemetry monitoring.",
            "staff": "Staff functions include: Recording sales via the Floor Terminal, viewing stock alerts, and managing their personal profile.",
            "security": "We use Bearer Token authentication and MongoDB for secure data persistence. All user actions are logged for integrity.",
            "sales": "The Sales Ledger tracks every transaction, updates stock levels in real-time, and feeds data into our predictive analytics engine.",
            "how to": "To use SmartStock: 1. Add categories, 2. Register products, 3. Record sales via the terminal. The system will automatically calculate EOQ/ROP and alert you if stock is low.",
            "doubt": "If you have doubts about any feature, try asking about 'EOQ', 'ROP', 'Charts', 'Donuts', 'Analysis', or 'Admin functions'. I can explain any part of the Nexus Command system.",
            "rupees": "The ₹ (Rupee) values in the header represent your total gross revenue from all recorded sales in the ledger.",
            "items": "The 'items' stat in the header shows the total quantity of individual products sold across all transactions.",
            "avg": "The 'avg' value represents the average revenue generated per sales transaction.",
            "telemetry": "Telemetry refers to the real-time data streaming from the inventory to your dashboard, showing stock flow velocity.",
            "dashboard": "The Dashboard (Nexus Command) is your central control unit. it shows telemetry, quick links, and a high-level inventory overview.",
            "profile": "The Profile page lets you manage your personal details, role, and upload a custom avatar photo that persists in the system."
        }

        # Check for keywords in knowledge base
        for key, response in knowledge.items():
            if key in message:
                return jsonify({"reply": response})

        # Dynamic Data Queries
        if any(k in message for k in ['low stock', 'critical', 'running out', 'out of stock']):
            low_stock_prods = list(products_col.find({"stock": {"$in": ['low', 'critical']}}))
            if not low_stock_prods:
                return jsonify({"reply": "System check complete: All stock levels are currently optimal. No immediate action required."})
            list_str = ", ".join([f"{p['name']} ({p['quantity']} left)" for p in low_stock_prods])
            return jsonify({"reply": f"Alert: The following items are at critical or low levels: {list_str}. I recommend using the EOQ suggested restock amounts."})
        
        if any(k in message for k in ['total sales', 'revenue', 'money', 'earned', 'rupees']):
            total_sales_agg = list(sales_col.aggregate([{"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}}]))
            amount = total_sales_agg[0]['total'] if total_sales_agg else 0
            return jsonify({"reply": f"Financial Summary: Total revenue recorded is ₹{amount:,.2f}. This data is synchronized across all admin terminals."})

        if any(k in message for k in ['inventory count', 'how many products', 'sku', 'stock size', 'items']):
            count = products_col.count_documents({})
            return jsonify({"reply": f"Inventory Audit: There are currently {count} unique SKUs in the database. You can view the full list in the Products page."})

        if 'help' in message or 'what can you do' in message:
            return jsonify({"reply": "I am the SmartStock Nexus AI. You can ask me about: 1. Technical terms (EOQ, ROP), 2. System features, 3. Real-time stock alerts, or 4. Sales performance. Try 'What items are low?' or 'Explain EOQ'."})

        # Default fallback
        return jsonify({"reply": f"As a SmartStock {role.capitalize()} Assistant, I'm focused on inventory optimization. I didn't quite catch that. Could you ask about stock levels, EOQ/ROP, or system features?"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def compute_rop(qty): return math.floor((50 if qty < 50 else 150) * 0.2)
def compute_eoq(qty, price):
    demand = qty * 12 if qty > 0 else 500
    order_cost = 50
    holding_cost = max(0.5, price * 0.1)
    return math.floor(math.sqrt((2 * demand * order_cost) / holding_cost))

@app.route('/api/alerts', methods=['GET'])
@auth_required
def get_alerts():
    try:
        products = list(products_col.find({}))
        alerts = []
        now = datetime.now()

        for p in products:
            rop = compute_rop(p['quantity'])
            eoq = compute_eoq(p['quantity'], p['price'])

            if p['quantity'] == 0:
                alerts.append({
                    "id": f"out-{p['id']}",
                    "productId": p['id'],
                    "productName": p['name'],
                    "type": 'Out of Stock',
                    "severity": 'high',
                    "message": f"{p['name']} ({p['id']}) is completely out of stock. Immediate restock required.",
                    "action": f"Restock now — EOQ suggests ordering {eoq} units",
                    "rop": rop,
                    "eoq": eoq,
                    "currentStock": p['quantity'],
                    "time": now.strftime("%I:%M %p")
                })
            elif p['stock'] == 'critical' or p['quantity'] <= 10:
                alerts.append({
                    "id": f"critical-{p['id']}",
                    "productId": p['id'],
                    "productName": p['name'],
                    "type": 'Critical Stock',
                    "severity": 'high',
                    "message": f"{p['name']} ({p['id']}) has only {p['quantity']} units left — below critical threshold.",
                    "action": f"Restock now — EOQ suggests ordering {eoq} units",
                    "rop": rop,
                    "eoq": eoq,
                    "currentStock": p['quantity'],
                    "time": now.strftime("%I:%M %p")
                })
            elif p['stock'] == 'low' or p['quantity'] <= rop:
                alerts.append({
                    "id": f"low-{p['id']}",
                    "productId": p['id'],
                    "productName": p['name'],
                    "type": 'Low Stock / Reorder Point',
                    "severity": 'medium',
                    "message": f"{p['name']} ({p['id']}) has {p['quantity']} units — at or below ROP of {rop}. Order soon.",
                    "action": f"Reorder {eoq} units (EOQ) to maintain stock levels",
                    "rop": rop,
                    "eoq": eoq,
                    "currentStock": p['quantity'],
                    "time": now.strftime("%I:%M %p")
                })

        alerts.sort(key=lambda x: x['severity'] == 'high', reverse=True)
        return jsonify(alerts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/restock', methods=['POST'])
@auth_required
def restock_product():
    try:
        body = request.json
        product_id = body.get('productId')
        quantity = body.get('quantity')
        
        if not product_id or quantity is None or float(quantity) <= 0:
            return jsonify({"error": "productId and a positive quantity are required"}), 400
        
        product = products_col.find_one({"id": product_id})
        if not product:
            return jsonify({"error": f"Product '{product_id}' not found"}), 404

        new_qty = product['quantity'] + float(quantity)
        stock_status = 'optimal'
        if new_qty == 0 or new_qty <= 10: stock_status = 'critical'
        elif new_qty <= 30: stock_status = 'low'
        
        products_col.update_one({"id": product_id}, {"$set": {"quantity": new_qty, "stock": stock_status}})

        # Record history
        history_col.insert_one({
            "productId": product['id'],
            "productName": product['name'],
            "type": 'inflow',
            "quantity": float(quantity),
            "timestamp": datetime.now()
        })

        return jsonify({"message": "Restocked successfully", "product": {**product, "quantity": new_qty, "stock": stock_status}})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    seed_data()
    app.run(port=5000)
