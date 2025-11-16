# API Usage Guide (Swagger + Postman)

This guide explains how to test the backend API using Swagger and the automated Postman workflow.

---

# 1. 📘 Using Swagger (Recommended during development)

Once the server is running:

```
http://localhost:5050/api-docs
```

Swagger lets you:
- Inspect all routes  
- Read request/response schemas  
- Test endpoints interactively  
- Understand authentication flow  

---

# 2. 🧪 Using Postman Workflow

The repo includes:

```
postman/EventForum.postman_collection.json
postman/EventForumEnvironment.json
```

Import both into Postman.

---

# 2.1 Setup Environment

1. Go to **Environments**  
2. Click **Import**  
3. Select `EventForumEnvironment.json`  
4. Set it as **active environment**

---

# 2.2 Import Collection

1. Go to **Collections**  
2. Click **Import**  
3. Select `EventForum.postman_collection.json`

---

# 2.3 Run the Workflow

1. Open the collection  
2. Click **Run Collection**  
3. Choose the environment  
4. Click **Start Run**

### The workflow will:
- Generate a **random test user**  
- Register the user  
- Log in  
- Save the JWT automatically  
- Test all protected routes  
- Test all admin routes  
- **Delete the test user at the end**  

All steps should pass (green).

---

