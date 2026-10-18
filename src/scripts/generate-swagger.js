const fs = require("fs");
const path = require("path");

const { swaggerSpec } = require("../docs/swagger");

// Output file at the project root
const outputPath = path.resolve(__dirname, "..", "..", "openapi.json");

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ OpenAPI contract written to ${outputPath}`);