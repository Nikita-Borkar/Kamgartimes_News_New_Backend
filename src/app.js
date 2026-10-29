const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const notFound = require("./middlewares/notFoundMiddleware");
const globalErrorHandler = require("./middlewares/errorMiddleware");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");

const app = express();

// Behind a proxy (Vercel, Render, nginx) the client IP comes from
// X-Forwarded-For; without this the rate limiters see the proxy address.
app.set("trust proxy", 1);

// Mount Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Body parsers (must come before routes so req.body is populated)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use(helmet());

// Comma-separated CORS_ORIGINS in .env for deployed frontends; local dev
// origins stay allowed so the website (3000) and admin panel (3001) work
// without extra configuration.
const defaultOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3000",
];
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigins =
  allowedOrigins.length ?
    [...new Set([...defaultOrigins, ...allowedOrigins])]
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin, curl and native apps send no Origin header.
      if (
        !origin ||
        corsOrigins.includes(origin) ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
        /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
        /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Rate limiting must be registered before the routes it protects.
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: "Too many requests" },
});
app.use("/api/v1", limiter);

// Routes
const apiRoutes = require("./routes/index");
app.use("/api/v1", apiRoutes);

// Root health / status check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Kamgar Times Backend API is running",
    docs: "/api-docs",
  });
});

// Catch-all as middleware: Express 5 no longer accepts a bare "*" path.
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
