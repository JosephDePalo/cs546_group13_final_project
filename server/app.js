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
import User from "./models/user.model.js";
import jwt from "jsonwebtoken";
import commentRoutes from "./routes/comments.routes.js";

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

app.use("/", async (req, res, next) => {
  const token = req.cookies?.Authorization;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password_hash -otp");
  } catch (err) {
    req.user = null;
  }
  next();
});

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
app.use("/api", commentRoutes);  //Add the comment routes to app.js.

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Resource ${req.originalUrl} not found` });
});

export default app;
