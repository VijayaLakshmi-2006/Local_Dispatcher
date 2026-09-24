
# 🚀 HyperDispatch – AI-Powered Hyperlocal Intelligent Dispatcher

HyperDispatch is an AI-powered hyperlocal delivery platform that intelligently connects customers with nearby stores and delivery partners for ultra-fast deliveries. The platform leverages AI-assisted shopping, smart order management, location-aware dispatching, and real-time order tracking to provide a seamless local commerce experience.

## 🌟 Features

### 🤖 AI Shopping Assistant

* Natural language shopping requests
* AI-generated shopping cart recommendations
* Context-aware prompts for:

  * Groceries
  * Vegetables
  * Fruits
  * Medicines
  * Electronics
  * Fast Food & Street Food
* Scenario-based shopping:

  * Birthday parties
  * Family gatherings
  * Feeling sick
  * Biryani ingredients
  * Hostel essentials
  * Emergency household supplies

### 🛒 Smart Cart Management

* Add, update, and remove items
* Dynamic pricing calculations
* Quantity management
* Intelligent checkout flow

### 📦 Order Management

* Active Orders
* Completed Orders
* Cancelled Orders
* Order history tracking
* Real-time status updates

### ⚡ Hyperlocal Dispatching

* Nearby store discovery
* Smart store selection
* Distance-based delivery optimization
* Fast dispatch assignment

### 🗺️ Location & Mapping

* Address management
* Delivery location selection
* Geolocation support
* Interactive map integration

### 💳 Flexible Payments

* Online payments
* Cash on Delivery (COD)
* Secure checkout process

### 🔄 Real-Time Tracking

* Live order status
* Delivery progress updates
* Estimated delivery time tracking

### 🔐 Authentication & Security

* User registration
* Secure login
* JWT authentication
* Protected routes

---

## 🏗️ System Architecture

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* Axios

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* MongoDB
* Mongoose ODM

### Authentication

* JWT (JSON Web Tokens)
* Password Hashing

### Deployment

* Vercel (Frontend)
* Node.js Server (Backend)

---

## 📂 Project Structure

```bash
HyperDispatch/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   │
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/your-username/hyperdispatch.git
cd hyperdispatch
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5003
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run Backend

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5003
```

Run Frontend

```bash
npm run dev
```

---

## 🔗 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Shops

```http
GET /api/shops
GET /api/shops/:id
```

### Orders

```http
POST /api/orders/create
GET /api/orders
GET /api/orders/:id
PATCH /api/orders/:id/status
```

---

## 📱 User Workflow

1. User signs in.
2. User interacts with AI Shopping Assistant.
3. AI generates shopping recommendations.
4. User adds products to cart.
5. User selects delivery address.
6. User chooses payment method.
7. Order is placed.
8. HyperDispatch assigns nearby store and delivery partner.
9. User tracks order in real time.
10. Order is completed and stored in order history.

---

## 🎯 Key Highlights

* AI-powered shopping assistance
* Hyperlocal delivery optimization
* Real-time order management
* Smart dispatching system
* Scalable architecture
* Responsive user interface
* Modern React + Node.js stack

---

## 🔮 Future Enhancements

* AI route optimization
* Live driver tracking
* Push notifications
* Voice-based shopping assistant
* Multi-language support
* Predictive demand analysis
* Store analytics dashboard
* Agent performance monitoring

---

## 👨‍💻 Author

**Pujitha (John)**

Computer Science Engineering Student
AI & Data Science Enthusiast
Full Stack Developer

---

## 📄 License

This project is developed for educational, research, and portfolio purposes.
