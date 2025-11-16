import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./openapi.yaml");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API service is running" });
});

// Routes
app.use("/api/v1/users", userRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Resource ${req.originalUrl} not found` });
});

export default app;
