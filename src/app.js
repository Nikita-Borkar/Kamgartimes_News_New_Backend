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

// Routes
const apiRoutes = require("./routes/index");

app.use("/api/v1", apiRoutes);

app.all("all", notFound);
app.use(globalErrorHandler);

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

module.exports = app;
