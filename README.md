
# 🛠️ Notes App Backend (Koa + PostgreSQL + Sequelize)

This is the backend service for the [Node Next Sample App](https://github.com/your-username/node-next-sample), built with **Koa**, **TypeScript**, **Sequelize**, and **PostgreSQL**.

It exposes simple REST APIs for user signup/login and authenticated CRUD operations on notes.
JWT-based authentication and UUID support are included for secure, scalable integration.

---

## 🚀 Features

- 🔐 JWT authentication with expiration support
- 🧾 CRUD operations for notes, scoped to user
- 🧰 Built with Koa 3, Sequelize, and TypeScript
- 🗃️ PostgreSQL database with auto table sync
- ⚙️ CORS-ready for frontend integration
- 🐳 Docker Compose for PostgreSQL
- 🧪 Startup script for local dev automation

---

## 📦 Prerequisites

Before running the app, ensure you have:

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Docker + Docker Compose**

Also, create a `.env` file based on a `.env.example` in the root directory with the following:

```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notesdb
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=15m
PORT=8000
```

---

## ⚙️ Setup Instructions (Recommended)

1. **Run the setup script**

  ```
    chmod +x startup.sh
    ./startup.sh
  ```

---

## 📡 API Endpoints

| Method | Endpoint     | Description                      | Auth Required |
| ------ | ------------ | -------------------------------- | ------------- |
| POST   | `/signup`    | Create a new user                | ❌             |
| POST   | `/login`     | Login and get a JWT              | ❌             |
| GET    | `/notes`     | Get all notes for logged-in user | ✅             |
| POST   | `/notes`     | Create a new note                | ✅             |
| PUT    | `/notes/:id` | Update a note                    | ✅             |
| DELETE | `/notes/:id` | Delete a note                    | ✅             |
| GET    | `/test`      | Simple hello world test          | ❌             |

---

## 🔧 Project Structure

```
├── src/
│   ├── index.ts          # Main app entry
│   ├── models/
│   │   ├── user.ts       # User model
│   │   ├── note.ts       # Note model
│   │   └── db.ts         # Sequelize config
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 Testing the API

Use tools like **Postman** or **cURL**.
Example login request:

```
  curl -X POST http://localhost:8000/login \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "testpass"}'
```

Use the returned JWT in `Authorization: Bearer <token>` for authenticated routes.

---

## 🧱 Deployment Notes

* Make sure to create the `.env` file with correct values
* Ensure your PostgreSQL server is reachable from your Linode VPS
* Pair this with the frontend app via reverse proxy or CORS configuration

---

## 📋 License

MIT — Use freely, fork easily.
