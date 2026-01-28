// Swagger UI Configuration
// OpenAPI documentation for Avella Ecommerce API

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Avella API Documentation',
};

module.exports = {
    swaggerUi,
    swaggerDocument,
    swaggerOptions,
};
