# Event Forum Backend

This repository contains the backend for the Event Forum application, built using **Node.js**, **Express**, **MongoDB**, and **Mongoose**.  
It provides authentication, user management, and administrative operations, along with full API documentation and automated Postman workflows.

---

# 📚 Table of Contents

1. [Project Overview](#project-overview)  
2. [Folder Structure](#folder-structure)  
3. [Setup Guide](docs/SETUP.md)  
4. [API Usage (Swagger + Postman Workflow)](docs/API_USAGE.md)  
5. [Git Workflow & Contribution Rules](docs/GIT_WORKFLOW.md)  
6. [Backend Architecture](docs/PROJECT_STRUCTURE.md)  

---

# 📘 Project Overview

The backend includes:

- JWT-based authentication  
- User CRUD operations  
- Admin-only user operations  
- Mongoose schema with validation  
- Automated Postman workflow  
- Swagger/OpenAPI documentation  
- ESLint + Prettier formatting  
- Husky pre-commit hooks  

All API endpoints are documented under:

```
http://localhost:5050/api-docs
```

---

# 📁 Folder Structure

```
server/
  app.js
  server.js
  config/
    db.js
  routes/
    user.routes.js
  controllers/
    user.controller.js
  models/
    user.model.js
  middlewares/
    auth.middleware.js
  utils/
    generateToken.js
  openapi.yaml

postman/
  EventForum.postman_collection.json
  EventForumEnvironment.json

docs/
  SETUP.md
  API_USAGE.md
  GIT_WORKFLOW.md
  PROJECT_STRUCTURE.md
```

---

# 🧑‍💻 Getting Started

Important doc links for developers. Please read the following documents in order:

1. **[SETUP.md](docs/SETUP.md)**  
   → How to run the backend, configure `.env`, and generate JWT secret

2. **[API_USAGE.md](docs/API_USAGE.md)**  
   → How to test all APIs using Swagger and Postman workflow

3. **[GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)**  
   → Branch naming rules, commit format, and PR workflows

4. **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**  
   → Explanation of all backend folders and components

---

# 🚫 Important Notes

- **Never push directly to `main`**  
- Always create a **feature branch**  
- Raise a **Pull Request**     
- PR must reference the issue number it solves
- Merge when necessary

Details:  
See **[GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)**

---

