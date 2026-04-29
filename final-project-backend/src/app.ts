import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import authRouter from "./routes/authRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import carModelRouter from "./routes/carModelRoutes.js";
import carRouter from "./routes/carRoutes.js";
import leadRouter from "./routes/leadRoutes.js";
import documentRouter from "./routes/documentRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import mediaRouter from "./routes/mediaRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import userRouter from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse-proxy headers (e.g. when behind Nginx)
app.set("trust proxy", true);

// Security headers
app.use(helmet());

// CORS — only allow configured frontend domains (comma-separated)
const allowedOrigins = (
  process.env.FRONTEND_DOMAIN ||
  "http://localhost:5173,http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error(`Cors: origin ${origin} not allowed`));
    },
  }),
);

// HTTP request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api/brands", brandRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/models", carModelRouter);
app.use("/api/cars", carRouter);
app.use("/api/leads", leadRouter);
app.use("/api/documents", documentRouter);
app.use("/api/reports", reportRouter);
app.use("/api/media", mediaRouter);
app.use("/api/activities", activityRouter);
app.use("/api/users", userRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Car Import Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: { message: `Route ${req.originalUrl} not found` },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be LAST middleware registered
app.use(errorHandler);

export default app;
