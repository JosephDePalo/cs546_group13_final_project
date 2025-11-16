# Backend Architecture & Project Structure

This document explains how the backend is organized.

---

# 1. 📁 server/app.js
- Loads Express  
- Sets JSON handling & CORS  
- Registers user routes (`/api/v1/users`)  
- Loads Swagger UI  
- Adds health check & 404 handler  

---

# 2. 📁 server/server.js
- Loads environment variables  
- Connects to MongoDB  
- Starts the Express server  

---

# 3. 📁 server/controllers/user.controller.js

Responsible for:
- Register
- Login
- Get profile
- Update profile
- Update password
- Admin CRUD:
  - getUsers
  - getUserById
  - deleteUser

---

# 4. 📁 server/models/user.model.js

Contains:
- Full User schema
- Validation rules
- `account_stats` subdocument
- Description metadata
- Password hashing pre-save hook
- `matchPassword` method

---

# 5. 📁 server/middlewares/auth.middleware.js

### protect
- Extracts JWT from header  
- Verifies token  
- Loads user (minus password fields)

### admin
- Allows only users with `is_admin: true`

---

# 6. 📁 server/routes/user.routes.js

Defines:
- `POST /register`
- `POST /login`
- `GET /profile`
- `PUT /profile`
- `PUT /password`
- Admin:
  - `GET /`
  - `GET /:id`
  - `DELETE /:id`

Uses:
```
protect
admin
```

---

# 7. 📁 postman/

Contains workflow + environment for automated testing.

---

# 8. 📘 server/openapi.yaml

The complete API specification used by Swagger.

---

