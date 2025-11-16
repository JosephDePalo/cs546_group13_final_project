# Setup Guide

This guide explains how to configure and run the Event Forum backend with clear, copy-paste commands.

---

# 0. 🔧 Prerequisites (Node.js)

The project requires **Node.js v18 or above**.

Check your version:

```bash
node -v
```

If Node is not installed or below 18, install Node using nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc 2>/dev/null || source ~/.zshrc
nvm install 21
nvm use 21
```

---

# 1. 📦 Install Dependencies

This project uses two package.json files.

### Root (linting tools)
```bash
npm install
```

### Server (backend dependencies)
```bash
cd server
npm install
```

---

# 2. 🔐 Environment Configuration

Create the `.env` file:

```bash
cd server
touch .env
```

Add the following:

```
PORT=5050
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<your-secret>
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output into `JWT_SECRET`.

---

# 3. ▶️ Run the Backend

```bash
cd server
npm run dev
```

Backend is now running at:

```
http://localhost:5050
```

---

# 4. 🩺 Health Check

```
GET http://localhost:5050/health
```

Expected:

```json
{
  "status": "ok",
  "message": "API service is running"
}
```

---

# 5. 📘 API Documentation (Swagger)

Swagger UI:

```
http://localhost:5050/api-docs
```

---

That’s all you need to get the backend running.
