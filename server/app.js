import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";
import pageRoutes from "./routes/pages.routes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import MethodOverride from "method-override";

const swaggerDocument = YAML.load("./openapi.yaml");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(MethodOverride("_method"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API service is running" });
});

// Page Routes
app.use("/", pageRoutes);

// API Routes
app.use("/api", cors());
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/events", eventRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Resource ${req.originalUrl} not found` });
});

export default app;
