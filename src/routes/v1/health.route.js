const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Kamagar Times API is running",
  });
});

module.exports = router;
