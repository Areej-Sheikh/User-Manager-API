# 🛠️ User Management App Backend (Node.js + Express + MongoDB)

A lightweight and scalable **REST API backend** built with:

✨ **User Management (CRUD)**  
📧 **Email Notifications using Nodemailer**  
📊 **Analytics API (Users by Location)**  
🔒 **Validation & Error Handling**  

This backend powers the React frontend and exposes clean, well-documented API endpoints.

## 🚀 Tech Stack

Technology | Purpose
-----------|---------
🟩 Node.js | Backend runtime
⚡ Express.js | Server framework
🍃 MongoDB + Mongoose | Database & ODM
✉️ Nodemailer | Email sending
🔐 dotenv | Environment variable management



## ⚙️ Setup Instructions

###  Install Dependencies

`cd backend`
`npm install`

###  Create .env File

`PORT=5000`
`MONGO_URI=`
`EMAIL_HOST=`
`EMAIL_PORT=`
`EMAIL_USER=`
`EMAIL_PASS=`
`FROM_NAME=`
`FROM_EMAIL=`

###  Start the Server

Development:
`npm run dev`

Production:
`npm start`

## 🔌 API Endpoints

### User Management

`GET /api/users - Get all users`
`POST /api/users - Create a new user`
`GET /api/users/:id - Get user by ID`
`PUT /api/users/:id - Update user`
`DELETE /api/users/:id - Delete a user`



## 🧠 Features

- Full CRUD API
- Nodemailer Email Support
- Analytics using MongoDB pipelines
- Middlewares (CORS, logging, JSON parser)
- Modular architecture


