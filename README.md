# 🍔 Cloud-Native Food Ordering & Delivery System (Microservices architecture)

> SE3020 – Distributed Systems | Year 3 Semester 2 – Group Project | 📅 2025 

---

## 📌 Project Overview

This is a cloud-native, microservices-based food ordering and delivery system designed as part of the SE3020 Distributed Systems course. Inspired by platforms like PickMe Food and UberEats, the application allows customers to browse restaurants, place food orders, and track deliveries in real-time. The system includes role-based access for Customers, Restaurant Admins, and Delivery Personnel.

---

## 🚀 Features

-  Browse restaurants and menu items
-  Add to cart and place orders
-  Role-based login (Customer, Restaurant, Delivery)
-  Secure Stripe payment integration
-  Real-time delivery tracking
-  Restaurant management portal
-  SMS & Email order confirmations (via Twilio & Nodemailer)
-  Microservices architecture using Docker and Kubernetes
-  Responsive frontend with React.js and Material UI

---

## 🧱 Microservices Overview

| Service               | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Auth Service          | Manages user registration, login, and JWT-based role authentication         |
| Restaurant Service    | Allows restaurant admins to manage menus and availability                   |
| Order Service         | Handles food orders, modifications, and order status                        |
| Delivery Service      | Assigns delivery personnel and tracks order status in real-time             |
| Payment Service       | Processes payments securely via Stripe                                       |
| Notification Service  | Sends email and SMS notifications on order events                           |

---

## 🛠️ Tech Stack

| Layer           | Tools / Frameworks                  |
|------------------|-------------------------------------|
| Frontend        | React.js, Material UI               |
| Backend         | Node.js, Express.js                 |
| Authentication  | JWT (JSON Web Tokens)               |
| Database        | MongoDB                             |
| Payments        | Stripe (Sandbox Mode)               |
| Notifications   | Nodemailer (Email)    |
| Containerization| Docker                              |
| Orchestration   | Kubernetes                          |
| Version Control | Git + GitHub                        |

---

## 🖼️ System Architecture

📎 Refer to `docs/architecture.png` for the system architecture diagram  
Each microservice runs in its own container and communicates via REST APIs or message queues (if applicable). Kubernetes handles orchestration and scaling.

---

### 🔧 Local Development Setup

```bash
# Clone the repo
git clone https://github.com/your-group-name/food-delivery-app.git
cd ds-food-delivery-app

# Start individual microservices (example for Auth Service)
cd services/auth
npm install
npm run dev

# Or build and run all services via Docker Compose
docker-compose up --build
```

---

🎥 [Watch our demo on YouTube](https://youtu.be/m5Q6hXyU0B4)

---

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 8_46_23 PM](https://github.com/user-attachments/assets/9242efc8-de64-4a03-9bda-8624e8bdc253)

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 8_46_46 PM](https://github.com/user-attachments/assets/de7c171f-8218-4a81-a6e7-b2f5c3509a63)

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 8_49_03 PM](https://github.com/user-attachments/assets/7fc944bc-a5bd-4a77-8a0b-3875ad42e382)

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 9_04_33 PM](https://github.com/user-attachments/assets/31c77bb9-ae23-46a1-b938-970697b65139)

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 8_57_41 PM](https://github.com/user-attachments/assets/6f24fb34-e6fa-48e0-a471-79c9b27c4af9)

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 8_55_12 PM](https://github.com/user-attachments/assets/ce1ee4a8-f39a-4496-9778-03a5549b085a)

![Food Ordering App - Personal - Microsoft​ Edge 5_20_2025 8_55_00 PM](https://github.com/user-attachments/assets/37609061-e0ff-4e06-a42c-5d7fce04df9f)
