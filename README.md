# 🚀 Nexus Advertising Platform

<p align="center">

<img src="https://img.shields.io/badge/Status-Under%20Development-FDDA02?style=for-the-badge" />
<img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />

</p>

<p align="center">

A modern, enterprise-grade advertising platform built with scalability, security, and performance in mind.

Designed around a referral-driven ecosystem featuring memberships, wallets, commissions, purchases, withdrawals, and a complete administrative management system.

</p>

---

# ✨ Overview

Nexus Advertising Platform is a full-stack web application that enables users to purchase advertising products, earn commissions through a multi-level referral system, manage wallets, upgrade memberships, and request withdrawals—all from a beautiful modern dashboard.

The platform also includes a powerful administrative portal for managing users, memberships, products, transactions, advertisements, reports, and platform settings.

---

# 🏗 Architecture

```text
                   ┌──────────────────────┐
                   │      Next.js App     │
                   │     (Frontend UI)    │
                   └──────────┬───────────┘
                              │
                         REST API
                              │
                   ┌──────────▼───────────┐
                   │   Express.js API     │
                   │   TypeScript Server  │
                   └──────────┬───────────┘
                              │
                     Business Services
                              │
             ┌────────────────┼────────────────┐
             │                │                │
        Authentication     Wallets      Memberships
             │                │                │
             └────────────────┼────────────────┘
                              │
                         Drizzle ORM
                              │
                   ┌──────────▼───────────┐
                   │     PostgreSQL       │
                   └──────────────────────┘
```

---

# 🛠 Technology Stack

## Frontend

| Technology      | Purpose         |
| --------------- | --------------- |
| Next.js         | React Framework |
| React           | UI Library      |
| TypeScript      | Type Safety     |
| Tailwind CSS    | Styling         |
| Zustand         | Global State    |
| TanStack Query  | Server State    |
| React Hook Form | Forms           |
| Zod             | Validation      |
| Axios           | API Client      |

---

## Backend

| Technology  | Purpose          |
| ----------- | ---------------- |
| Node.js     | Runtime          |
| Express.js  | REST API         |
| TypeScript  | Type Safety      |
| PostgreSQL  | Database         |
| Drizzle ORM | ORM              |
| JWT         | Authentication   |
| bcrypt      | Password Hashing |

---

# ⚡ Core Modules

* 🔐 Authentication
* 👤 User Management
* 💳 Wallet System
* 💰 Commission Engine
* 👥 Three-Level Referral System
* 🎖 Membership Management
* 📦 Products
* 🛒 Purchases
* 📈 Earnings
* 💸 Withdrawals
* 📢 Advertisements
* 🔔 Notifications
* 📊 Reports
* 🛡 Admin Dashboard

---

# 🔒 Security Features

* JWT Authentication
* Refresh Token Rotation
* Password Hashing (bcrypt)
* Protected Routes
* Role-Based Authorization
* Input Validation
* Transaction Safety
* Secure Database Access

---

# 📂 Project Structure

```text
client/
│
├── app/
├── components/
├── services/
├── store/
├── hooks/
├── schema/
└── types/

server/
│
├── modules/
├── database/
├── middlewares/
├── services/
├── helpers/
├── validators/
├── utils/
└── routes/
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nexus-advertising-platform.git
```

```bash
cd nexus-advertising-platform
```

---

## Install dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

# ⚙ Environment Variables

Create a `.env` file inside the **server** directory.

Example:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=

JWT_SECRET=

JWT_REFRESH_SECRET=

CLIENT_URL=
```

---

# ▶ Running the project

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

# 📦 Production Build

Backend

```bash
npm run build
```

Frontend

```bash
npm run build
```

---

# 📈 Development Status

| Module           | Status         |
| ---------------- | -------------- |
| Authentication   | ✅ Completed    |
| Wallet           | ✅ Completed    |
| Membership Plans | ✅ Completed    |
| Referral System  | 🚧 In Progress |
| Products         | 🚧 In Progress |
| Purchases        | 🚧 In Progress |
| Withdrawals      | 🚧 In Progress |
| Advertisements   | 🚧 In Progress |
| Reports          | ⏳ Planned      |
| Notifications    | ⏳ Planned      |

---

# 🤝 Contributing

This project is currently under active development.

Pull requests are not being accepted at this stage.

---

# 📜 License

This project is proprietary software.

All rights reserved.

---

<p align="center">

### Built with ❤️ using Next.js, Express.js, TypeScript & PostgreSQL

</p>
