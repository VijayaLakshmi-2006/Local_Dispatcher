
# Hyper Local Delivery Dispatcher API

# 🔧 Backend Architecture

The HyperDispatch backend is built using **Node.js, Express.js, MongoDB, and Mongoose** following a modular MVC architecture.

## 📁 Backend Folder Structure

```bash
backend/
│
├── config/
│   ├── db.js
│   └── environment.js
│
├── controllers/
│   ├── authController.js
│   ├── orderController.js
│   ├── shopController.js
│   ├── userController.js
│   └── aiController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Shop.js
│   ├── Product.js
│   ├── Order.js
│   ├── DeliveryAgent.js
│   └── Address.js
│
├── routes/
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── shopRoutes.js
│   ├── userRoutes.js
│   └── aiRoutes.js
│
├── services/
│   ├── aiService.js
│   ├── dispatchService.js
│   ├── locationService.js
│   └── paymentService.js
│
├── utils/
│   ├── distanceCalculator.js
│   ├── responseHandler.js
│   └── logger.js
│
└── server.js
```

---

# 🗄️ Database Design

MongoDB is used as the primary database.

---

## 👤 User Schema

Stores customer account information.

```javascript
{
  _id,
  name,
  email,
  password,
  phone,
  role,
  addresses: [],
  createdAt,
  updatedAt
}
```

### Fields

| Field     | Type            |
| --------- | --------------- |
| name      | String          |
| email     | String          |
| password  | String (Hashed) |
| phone     | String          |
| role      | String          |
| addresses | Array           |

---

## 🏪 Shop Schema

Stores nearby shop information.

```javascript
{
  _id,
  shopName,
  ownerName,
  category,
  address,
  location,
  rating,
  products,
  isOpen,
  createdAt
}
```

### Location

```javascript
{
  latitude,
  longitude
}
```

---

## 📦 Product Schema

Stores inventory available in local shops.

```javascript
{
  _id,
  name,
  category,
  description,
  image,
  price,
  stock,
  shopId,
  createdAt
}
```

---

## 🚚 Delivery Agent Schema

Stores delivery partner information.

```javascript
{
  _id,
  name,
  phone,
  vehicleType,
  currentLocation,
  availabilityStatus,
  assignedOrders,
  rating
}
```

### Availability Status

```text
Available
Busy
Offline
```

---

## 📍 Address Schema

Stores user delivery locations.

```javascript
{
  _id,
  userId,
  flatNumber,
  buildingName,
  street,
  landmark,
  city,
  state,
  pincode,
  latitude,
  longitude
}
```

---

## 🛒 Order Schema

Core schema for HyperDispatch.

```javascript
{
  _id,
  orderId,
  userId,
  shopId,
  deliveryAgentId,

  items: [
    {
      productId,
      name,
      quantity,
      price
    }
  ],

  deliveryAddress,

  subtotal,
  deliveryFee,
  tax,
  totalAmount,

  paymentMethod,
  paymentStatus,

  orderStatus,

  estimatedDeliveryTime,

  createdAt,
  updatedAt,
  deliveredAt,
  cancelledAt
}
```

---

# 📋 Order Status Flow

```text
Placed
↓
Confirmed
↓
Preparing
↓
Agent Assigned
↓
Picked Up
↓
Out For Delivery
↓
Delivered
```

Cancelled orders can occur at:

```text
Placed
Confirmed
Agent Assigned
```

---

# 💳 Payment System

Supported payment methods:

### Online Payments

* UPI
* Google Pay
* PhonePe
* Paytm
* Debit Cards
* Credit Cards

### Offline Payments

* Cash On Delivery (COD)

Payment Status:

```text
Pending
Paid
Failed
Refunded
```

---

# 🤖 AI Shopping Assistant Workflow

```text
User Query
↓
AI Processing
↓
Intent Detection
↓
Product Identification
↓
Store Matching
↓
Cart Generation
↓
Checkout
```

Example:

```text
"Birthday party snacks for 10 people under ₹1500"
```

AI Generates:

```text
Cake
Soft Drinks
Chips
Biscuits
Ice Cream
Paper Plates
```

and adds products to cart.

---

# ⚡ Hyperlocal Dispatch Engine

The dispatch engine automatically selects:

1. Nearest Store
2. Available Inventory
3. Available Delivery Agent
4. Shortest Route

Selection Formula:

```text
Distance = 50%
Inventory Availability = 30%
Agent Availability = 20%
```

---

# 🗺️ Location Intelligence

Features:

* Geolocation
* Address Geocoding
* Delivery Radius Validation
* Store Proximity Search

Supported Radius:

```text
1km – 5km
```

Beyond 5km:

```text
Store unavailable for ultra-fast delivery
```

---

# 🔒 Security Features

### Authentication

* JWT Tokens
* Password Hashing
* Protected Routes

### Security Measures

* Request Validation
* Input Sanitization
* Role-Based Access Control
* Secure API Communication

---

# 📡 REST API Overview

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Shops

```http
GET /api/shops
GET /api/shops/:id
```

## Products

```http
GET /api/products
GET /api/products/:id
```

## Orders

```http
POST /api/orders/create
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status
DELETE /api/orders/:id/cancel
```

## AI Assistant

```http
POST /api/ai/shopping-assistant
```

---

# 🚀 Backend Highlights

✅ MVC Architecture

✅ MongoDB Database

✅ JWT Authentication

✅ AI Shopping Assistant Integration

✅ Hyperlocal Dispatch Logic

✅ Order Lifecycle Management

✅ Payment Management

✅ Location-Aware Delivery

✅ Scalable REST APIs

✅ Production-Ready Architecture

The project now supports an AI-powered local commerce flow: customers describe what they need, the AI extracts product intent, nearby shops are searched and ranked, and one-click ordering starts the existing delivery workflow.

## Setup

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

MongoDB must be running before the backend starts. The backend creates 2dsphere indexes for agent and order GeoJSON fields through Mongoose.

## Environment

Backend `.env`:

- `PORT`: Express and Socket.IO port. Default `5002`.
- `MONGO_URL`: MongoDB connection string.
- `MONGO_URI`: MongoDB connection string alias.
- `JWT_SECRET`: JWT signing secret.
- `SOCKET_PORT`: optional server/socket port alias.
- `FRONTEND_URL`: CORS origin for Socket.IO.
- `AGENT_SEARCH_RADIUS_METERS`: default nearby search radius.
- `ONLINE_AGENT_WINDOW_MINUTES`: how recently an agent must update location to count as online.
- `SHOP_SEARCH_RADIUS_METERS`: nearby shop search radius.
- `OPENAI_API_KEY`: enables AI intent extraction through OpenAI.
- `OPENAI_MODEL`: model used by the AI service. Defaults to `gpt-5.2-mini`.
- `GEMINI_API_KEY`: reserved for a future Gemini provider.

Frontend `.env`:

- `VITE_API_URL`: backend REST API base URL.
- `VITE_SOCKET_URL`: Socket.IO server URL.

## Auth

All protected requests use:

```http
Authorization: Bearer <token>
```

Registering a user with `role: "agent"` automatically creates an `Agent` profile.

## Create Order

`POST /api/orders/create`

Role: `customer`

```json
{
  "pickupLocation": {
    "address": "Miyapur Metro Station, Hyderabad",
    "latitude": 17.4969,
    "longitude": 78.3618
  },
  "deliveryLocation": {
    "address": "KPHB Colony, Hyderabad",
    "latitude": 17.4933,
    "longitude": 78.3996
  },
  "packageDetails": "Food Package",
  "price": 250,
  "paymentMethod": "cash"
}
```

Address-only payloads still work:

```json
{
  "pickupAddress": "Miyapur",
  "deliveryAddress": "KPHB",
  "packageDetails": "Food Package",
  "price": 250,
  "paymentMethod": "cash"
}
```

When pickup coordinates are present, the backend searches available online agents by `$near`, `$geometry`, and `$maxDistance`. The closest agent is assigned automatically. If no agent is found, the order remains `pending`.

## Update Agent Location

`PUT /api/agents/location`

Role: `agent`

```json
{
  "latitude": 17.4483,
  "longitude": 78.3915
}
```

Response includes the updated agent profile and emits `agentLocationUpdate` to the active order room and admin dashboard.

## Find Nearby Agents

`GET /api/agents/nearby?latitude=17.4483&longitude=78.3915&radius=5000`

Roles: `customer`, `admin`

Returns available agents sorted by nearest distance.

## Track Order

`GET /api/orders/track/:orderId`

Roles: owning `customer`, assigned `agent`, or `admin`

Returns order locations, status, assigned agent, current agent location, and Socket.IO room name.

## Order Status

`PUT /api/orders/update-status/:orderId`

Role: assigned `agent`

Allowed status values:

- `picked_up`
- `out_for_delivery`
- `delivered`

`delivered` sets `deliveredAt`, clears the agent active order, marks the agent available, and emits `orderDelivered`.

## Admin Map Dashboard

`GET /api/admin/map-dashboard`

Role: `admin`

Returns active orders and online agents for the dashboard map.

## Socket.IO Events

Client emits:

- `joinOrder` with `orderId`
- `leaveOrder` with `orderId`
- `joinAdmin`

Server emits:

- `agentLocationUpdate`
- `agentLocationUpdated`
- `orderCreated`
- `orderAssigned`
- `agentAssigned`
- `orderAccepted`
- `orderStatusUpdate`
- `orderDelivered`

## AI Architecture

`backend/services/aiService.js` extracts commerce intent from natural language. When `OPENAI_API_KEY` exists, it calls the OpenAI Responses API with structured JSON output. Without a key, it falls back to deterministic keyword parsing so local development still works.

`backend/services/recommendationService.js` searches shops and scores matches:

- 40% distance
- 25% rating
- 20% price
- 15% availability

`SearchLog` records product, category, urgency, location, and recommendation count for analytics.

## Shop Database

`POST /api/shops`

Role: `admin`

```json
{
  "shopName": "Miyapur MedPlus",
  "ownerName": "Ravi Kumar",
  "category": "Medicine",
  "phone": "9000000001",
  "address": "Miyapur Main Road, Hyderabad",
  "latitude": 17.4969,
  "longitude": 78.3618,
  "rating": 4.7,
  "products": [
    {
      "name": "Paracetamol",
      "description": "Fever and pain relief tablet",
      "price": 35,
      "stock": 25,
      "category": "Medicine",
      "keywords": ["dolo", "crocin", "calpol", "fever"]
    }
  ]
}
```

Demo seed:

`POST /api/shops/seed-demo`

## AI Search

`POST /api/ai/search`

Role: `customer`, `admin`

```json
{
  "query": "I need paracetamol urgently",
  "customerLocation": {
    "address": "Madhapur, Hyderabad",
    "latitude": 17.4483,
    "longitude": 78.3915
  }
}
```

Response:

```json
{
  "product": "Paracetamol",
  "category": "Medicine",
  "urgency": "High",
  "budget": null,
  "quantity": 1,
  "priority": "HIGH",
  "recommendations": [
    {
      "shop": { "shopName": "Miyapur MedPlus" },
      "product": { "name": "Paracetamol", "price": 35, "stock": 25 },
      "distanceMeters": 1200,
      "etaMinutes": 15,
      "score": 91
    }
  ]
}
```

## One-Click AI Order

`POST /api/ai/order`

Role: `customer`

```json
{
  "shopId": "SHOP_ID",
  "productId": "PRODUCT_ID",
  "quantity": 1,
  "query": "I need paracetamol urgently",
  "customerLocation": {
    "address": "Madhapur, Hyderabad",
    "latitude": 17.4483,
    "longitude": 78.3915
  },
  "intent": {
    "product": "Paracetamol",
    "category": "Medicine",
    "urgency": "High",
    "budget": null
  }
}
```

The backend turns the selected shop into the pickup location and the customer coordinate into the delivery location. It then auto-assigns the closest available agent.

## AI Analytics

`GET /api/ai/analytics`

Role: `admin`

Returns:

- most searched products
- most searched categories
- high demand locations
- peak delivery hours
- top performing agents

## Testing Maps

1. Start MongoDB, backend, and frontend.
2. Register/login an agent and customer.
3. Save the agent token in the frontend sidebar.
4. Open Agent Dashboard and update location near the pickup coordinate.
5. Save the admin token and call `POST /api/shops/seed-demo`.
6. Save the customer token, open Ask Hyper, and search for `I need paracetamol urgently`.
7. Click `Order Now`.
8. Use the returned order id in Live Tracking.
9. Update the agent location or status and watch the tracking map update without refresh.

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  API_DOCUMENTATION.md
  req.http
  server.js
frontend/
  src/
    api/
    components/
    pages/
    utils/
```
