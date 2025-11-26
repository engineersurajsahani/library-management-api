const express = require('express');
const Book = require('../models/Book');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management APIs
 */

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Returns the list of all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (request, response) => {
  try {
    const books = await Book.find();
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Get a book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (request, response) => {
  try {
    const book = await Book.findById(request.params.id);

    if (!book) {
      return response.status(404).json({
        status: 'error',
        message: 'Book not found',
      });
    }
    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, async (request, response) => {
  try {
    console.log(request.user);

    if (request.user.role === 'STUDENT') {
      return response.status(403).json({
        status: 'error',
        message: 'Access denied. Only LIBRARIAN can add books.',
      });
    }

    const { title, author, publishedYear, category, quantity } = request.body;

    if (!title || !author || !publishedYear || !category || !quantity) {
      return response.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    const newBook = {
      title,
      author,
      publishedYear,
      category,
      quantity,
    };

    const book = await Book.create(newBook);
    book.save();

    response.status(201).json({
      status: 'success',
      message: 'Book added successfully',
      data: newBook,
    });
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   put:
 *     summary: Update a book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The book was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, async (request, response) => {
  try {
    if (request.user.role === 'STUDENT') {
      return response.status(403).json({
        status: 'error',
        message: 'Access denied. Only LIBRARIAN can update books.',
      });
    }

    const book = await Book.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
    });

    if (!book) {
      return response.status(404).json({
        status: 'error',
        message: 'Book not found',
      });
    }

    response.status(200).json({
      status: 'success',
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book was deleted
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, async (request, response) => {
  try {
    console.log(request.user);

    if (request.user.role === 'STUDENT') {
      return response.status(403).json({
        status: 'error',
        message: 'Access denied. Only LIBRARIAN can delete books.',
      });
    }

    const book = await Book.findByIdAndDelete(request.params.id);

    if (!book) {
      return response.status(404).json({
        status: 'error',
        message: 'Book not found',
      });
    }

    response.status(200).json({
      status: 'success',
      message: 'Book deleted successfully',
    });
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
