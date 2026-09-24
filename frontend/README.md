# 🎨 Frontend Architecture

The HyperDispatch frontend is built using **React.js**, **Vite**, **JavaScript**, and modern component-based architecture to deliver a fast, responsive, and interactive user experience.

---

# 🏗️ Frontend Tech Stack

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| React.js          | UI Development          |
| Vite              | Build Tool              |
| JavaScript (ES6+) | Application Logic       |
| React Router      | Client-side Routing     |
| Axios             | API Communication       |
| Context API       | Global State Management |
| CSS3              | Styling                 |
| Local Storage     | Session Persistence     |

---

# 📁 Frontend Folder Structure

```bash
frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── ProductCard/
│   │   ├── CartDrawer/
│   │   ├── OrderCard/
│   │   ├── TrackingMap/
│   │   ├── AiCartSection/
│   │   └── PaymentModal/
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Shops.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Orders.jsx
│   │   ├── Tracking.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── OrderContext.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── orderService.js
│   │   ├── shopService.js
│   │   └── authService.js
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── vite.config.js
```

---

# 🏠 Main User Pages

## Home Page

The landing page allows users to:

* Search nearby stores
* Browse categories
* Use AI Shopping Assistant
* View featured shops
* Access hyperlocal delivery services

Features:

```text
Nearby Stores
AI Shopping Assistant
Popular Categories
Fast Delivery Highlights
```

---

# 🤖 AI Shopping Assistant

One of the core features of HyperDispatch.

Users can enter natural language prompts such as:

```text
Birthday party snacks for 10 people
```

```text
Groceries for a family of 4 for one week
```

```text
I'm feeling sick, suggest essentials
```

```text
Need a mobile charger under ₹500
```

The assistant automatically:

1. Understands user intent
2. Identifies products
3. Generates a shopping list
4. Adds products to cart

---

# 🛍️ Product Browsing

Users can:

* Browse nearby stores
* View products
* Search products
* Filter by category
* Check prices
* Add products to cart

Categories include:

```text
Groceries
Vegetables
Fruits
Medicines
Electronics
Fast Food
Street Food
```

---

# 🛒 Cart Management

Cart functionality includes:

### Add to Cart

Users can add products from:

* Shop listings
* Product pages
* AI Assistant recommendations

### Update Quantity

```text
Increase Quantity
Decrease Quantity
Remove Item
```

### Cart Summary

Displays:

```text
Subtotal
Delivery Charges
Taxes
Grand Total
```

---

# 📦 Checkout Page

Users provide:

### Delivery Information

```text
Flat Number
Building Name
Street
Landmark
City
```

### Delivery Location

Map-based location confirmation.

### Payment Method

```text
UPI
Google Pay
PhonePe
Paytm
Credit Card
Debit Card
Cash on Delivery
```

---

# 🚚 Orders Page

Displays:

## Active Orders

Current deliveries in progress.

Order Information:

```text
Order ID
Store Name
Order Status
Estimated Delivery Time
Payment Status
```

Actions:

```text
Track Order
Cancel Order
Proceed to Payment
```

---

## Completed Orders

Displays:

```text
Delivered Orders
Delivery Time
Purchased Items
Total Paid Amount
```

Actions:

```text
View Details
Reorder
```

---

## Cancelled Orders

Displays:

```text
Cancelled Orders
Cancellation Date
Cancellation Reason
```

Actions:

```text
View Details
Reorder
```

---

# 📍 Real-Time Tracking Page

Provides live order tracking.

Displays:

### Delivery Route

```text
Store Location
Delivery Agent
Customer Location
```

### Status Timeline

```text
Placed
Confirmed
Preparing
Picked Up
Out For Delivery
Delivered
```

### ETA

```text
Arriving in 5–8 Minutes
```

---

# 🔐 Authentication Flow

## Registration

Users can create accounts using:

```text
Name
Email
Password
Phone Number
```

## Login

Secure authentication using:

```text
Email
Password
```

JWT tokens are stored securely for session management.

---

# 🌐 API Integration Layer

Frontend communicates with backend through Axios.

Example:

```javascript
axios.post("/api/orders/create", orderData);
```

Services:

```javascript
authService.js
shopService.js
orderService.js
aiService.js
```

---

# 🧠 State Management

Implemented using Context API.

## Auth Context

Stores:

```javascript
User Information
Authentication State
JWT Token
```

## Cart Context

Stores:

```javascript
Cart Items
Cart Total
Item Quantity
```

## Order Context

Stores:

```javascript
Active Orders
Completed Orders
Cancelled Orders
```

---

# 📱 Responsive Design

Optimized for:

### Desktop

* Full dashboard experience
* Multi-column layouts

### Tablet

* Adaptive navigation
* Responsive cards

### Mobile

* Touch-friendly UI
* Mobile-first checkout
* Optimized order tracking

---

# 🎯 Frontend Highlights

✅ AI Shopping Assistant

✅ Hyperlocal Store Discovery

✅ Smart Cart Management

✅ Dynamic Checkout Flow

✅ Order Lifecycle Tracking

✅ Payment Integration

✅ Responsive UI

✅ Context-Based State Management

✅ Real-Time Updates

✅ Modern React Architecture
