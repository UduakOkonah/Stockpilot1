# StockPilot

Smart Inventory & Sales Management System for small businesses, shops, and vendors.

## Overview

StockPilot is a modern inventory management web application designed to help small business owners track products, manage stock movement, monitor sales, calculate profit, and generate receipts from one centralized dashboard.

The platform was built to solve the common problem of manual stock tracking using notebooks, memory, or spreadsheets that often lead to stock loss, inaccurate sales records, and poor business decisions.

---

## Live Demo

Frontend: https://stockpilot-kohl.vercel.app/

Backend API: https://stockpilot-h4dq.onrender.com

---

## Features

### Authentication & Security
- User registration and login
- JWT authentication
- Protected dashboard routes
- Multi-user isolated business data

### Inventory Management
- Add new products
- Edit and update products
- Delete inventory items
- SKU validation
- Low stock detection
- Out-of-stock monitoring

### Sales & Transactions
- Stock-in and stock-out tracking
- Sales recording
- Revenue tracking
- Automatic profit calculation
- Customer information tracking
- Payment method tracking

### Dashboard Analytics
- Revenue statistics
- Profit statistics
- Stock movement visualization
- Revenue trend charts
- Profit trend charts
- Most moved products
- Smart inventory insights
- Restock suggestions

### Receipt & Reports
- PDF receipt generation
- CSV transaction export
- PDF transaction reports
- Business profile customization
- Receipt branding support

### Settings System
- Business profile settings
- Receipt preferences
- Inventory preferences
- Dark mode support preparation
- Local storage settings persistence

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- jsPDF
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

### Deployment
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

---

## Project Structure

```bash
stockpilot/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── context/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── config/
│
└── README.md
```

---

## Installations

### Clone Repository

```bash
git clone https://github.com/UduakOkonah/stockpilot
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Create a `.env` file inside the client folder:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Run Locally

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

---

## Key Challenges Solved

- Multi-user inventory isolation
- JWT authentication integration
- Profit calculation logic
- Dynamic receipt generation
- Dashboard analytics aggregation
- MongoDB deployment configuration
- Vercel + Render production deployment

---

## Future Improvements

- Full light mode support
- Email notifications
- Barcode scanning
- Sales forecasting
- AI-powered analytics
- Mobile application
- Multi-store support
- POS integration

---

## Author

Uduakobong Lawrence Okonah

Software Developer | BYU-Idaho Software Development Student

GitHub:  https://github.com/UduakOkonah
LinkedIn: https://www.linkedin.com/in/uduakobong-okonah-b5bb96252/

---
