const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const notFound = require("./middlewares/notFoundMiddleware");
const globalErrorHandler = require("./middlewares/errorMiddleware");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");

const app = express();

// Mount Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Body parsers (must come before routes so req.body is populated)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

// Routes
const apiRoutes = require("./routes/index");
app.use("/api/v1", apiRoutes);

app.all("all", notFound);
app.use(globalErrorHandler);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

module.exports = app;
