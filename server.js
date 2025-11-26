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
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author', 'publishedYear', 'category', 'quantity'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the book',
            },
            title: {
              type: 'string',
              description: 'The title of the book',
            },
            author: {
              type: 'string',
              description: 'The author of the book',
            },
            publishedYear: {
              type: 'number',
              description: 'The year the book was published',
            },
            category: {
              type: 'string',
              description: 'The category of the book',
            },
            quantity: {
              type: 'number',
              description: 'The quantity of books available',
            },
            status: {
              type: 'string',
              enum: ['AVAILABLE', 'NOT AVAILABLE'],
              description: 'The availability status of the book',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the book was added',
            },
          },
          example: {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            publishedYear: 1925,
            category: 'Fiction',
            quantity: 5,
          },
        },
        User: {
          type: 'object',
          required: ['name', 'username', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the user',
            },
            name: {
              type: 'string',
              description: 'The name of the user',
            },
            username: {
              type: 'string',
              description: 'The username of the user',
            },
            email: {
              type: 'string',
              description: 'The email of the user',
            },
            password: {
              type: 'string',
              description: 'The password of the user',
            },
            role: {
              type: 'string',
              enum: ['LIBRARIAN', 'STUDENT'],
              description: 'The role of the user',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date the user was registered',
            },
          },
          example: {
            name: 'John Doe',
            username: 'johndoe',
            email: 'john@example.com',
            password: 'password123',
            role: 'STUDENT',
          },
        },
        IssueBook: {
          type: 'object',
          required: ['bookId', 'bookName', 'studentId', 'studentName', 'issueDate', 'returnDate'],
          properties: {
            id: {
              type: 'string',
              description: 'The auto-generated id of the issued book record',
            },
            bookId: {
              type: 'string',
              description: 'The ID of the book',
            },
            bookName: {
              type: 'string',
              description: 'The name of the book',
            },
            studentId: {
              type: 'string',
              description: 'The ID of the student',
            },
            studentName: {
              type: 'string',
              description: 'The name of the student',
            },
            issueDate: {
              type: 'string',
              format: 'date-time',
              description: 'The date the book was issued',
            },
            returnDate: {
              type: 'string',
              format: 'date-time',
              description: 'The date the book should be returned',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ISSUE BOOK', 'RETURN BOOK'],
              description: 'The status of the issued book',
            },
          },
          example: {
            bookId: '60f7b3b3d3a5e80015e6a3d1',
            bookName: 'The Great Gatsby',
            studentId: '60f7b3b3d3a5e80015e6a3d2',
            studentName: 'John Doe',
            issueDate: '2023-06-21T00:00:00.000Z',
            returnDate: '2023-07-05T00:00:00.000Z',
            status: 'ISSUE BOOK',
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
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