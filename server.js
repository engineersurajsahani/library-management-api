const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bookRouter = require('./src/routes/bookRouter');
const issueBookRouter = require('./src/routes/issueBookRouter');
const userRouter = require('./src/routes/userRouter');
const db = require('./src/config/db');
const { limiter, securityHeaders } = require('./src/middlewares/security');

// Swagger Setup
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management API',
      version: '1.0.0',
      description:
        'A simple Express Library Management API with Swagger documentation',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

const app = express();

app.use(cors());
app.use(express.json());

// Security middleware
app.use(securityHeaders);
app.use(limiter);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const requestLoggingMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};
app.use(requestLoggingMiddleware);

app.get('/health', (request, response) => {
  response.status(200).json({
    status: 'OK',
    timeStamp: new Date().toISOString(),
    service: 'Server is up and running',
  });
});

app.use('/api/v1/books', bookRouter);
app.use('/api/v1/issue-book', issueBookRouter);
app.use('/api/v1/users', userRouter);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`Swagger UI available at: http://localhost:${port}/api-docs`);
});
