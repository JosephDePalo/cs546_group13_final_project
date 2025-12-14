import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";
import pageRoutes from "./routes/pages.routes.js";
import reportRoutes from "./routes/report.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import MethodOverride from "method-override";
import { setUserInfo } from "./middlewares/auth.middleware.js";

const swaggerDocument = YAML.load("./openapi.yaml");

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  partialsDir: ["views/partials"],
  helpers: {
    eq: (x, y) => x === y,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(MethodOverride("_method"));

// Always set req.user if the user is logged in
app.use("/", setUserInfo);

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
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/comments", commentRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Resource ${req.originalUrl} not found` });
});

export default app;
