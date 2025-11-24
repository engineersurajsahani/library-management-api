const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const IssueBook = require('../models/IssueBook');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Issue Books
 *   description: Issue book management APIs
 */

/**
 * @swagger
 * /api/v1/issue-book/issued-book:
 *   post:
 *     summary: Issue a book to a student
 *     tags: [Issue Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - bookName
 *               - studentId
 *               - studentName
 *               - issueDate
 *               - returnDate
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: The ID of the book
 *               bookName:
 *                 type: string
 *                 description: The name of the book
 *               studentId:
 *                 type: string
 *                 description: The ID of the student
 *               studentName:
 *                 type: string
 *                 description: The name of the student
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 description: The date the book is issued
 *               returnDate:
 *                 type: string
 *                 format: date
 *                 description: The date the book should be returned
 *     responses:
 *       201:
 *         description: Book issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IssueBook'
 *       400:
 *         description: Bad request - Book not available
 *       404:
 *         description: Book or Student not found
 *       500:
 *         description: Internal server error
 */
router.post('/issued-book', authMiddleware, async (request, response) => {
  try {
    if (request.user.role === 'STUDENT') {
      return response.status(403).json({
        status: 'error',
        message: 'Access denied. Only LIBRARIAN can issue books.',
      });
    }

    const { bookId, bookName, studentId, studentName, issueDate, returnDate } =
      request.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return response.status(404).json({
        status: 'error',
        message: 'Book not found',
      });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return response.status(404).json({
        status: 'error',
        message: 'Student not found',
      });
    }

    if (book.quantity < 1) {
      return response.status(400).json({
        status: 'error',
        message: 'Book is not available',
      });
    }

    const newIssueBook = {
      bookId,
      bookName,
      studentId,
      studentName,
      issueDate: new Date(issueDate),
      returnDate: new Date(returnDate),
      status: 'ISSUE BOOK',
    };

    const issueBook = await IssueBook.create(newIssueBook);
    issueBook.save();

    book.quantity = book.quantity - 1;
    book.save();

    response.status(201).json({
      status: 'success',
      message: 'Book issued successfully',
      data: issueBook,
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
 * /api/v1/issue-book/return-book/{id}:
 *   post:
 *     summary: Return an issued book
 *     tags: [Issue Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Issue Book ID
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Bad request - Book already returned
 *       404:
 *         description: Issued book record not found
 *       500:
 *         description: Internal server error
 */
router.post('/return-book/:id', authMiddleware, async (request, response) => {
  try {
    if (request.user.role === 'STUDENT') {
      return response.status(403).json({
        status: 'error',
        message: 'Access denied. Only LIBRARIAN can return books.',
      });
    }

    const issueBookId = request.params.id;
    const issueBook = await IssueBook.findById(issueBookId);

    if (!issueBook) {
      return response.status(404).json({
        status: 'error',
        message: 'Issued book record not found',
      });
    }

    if (issueBook.status === 'RETURN BOOK') {
      return response.status(400).json({
        status: 'error',
        message: 'Book is already returned',
      });
    }

    issueBook.status = 'RETURN BOOK';
    await issueBook.save();

    const book = await Book.findById(issueBook.bookId);
    book.quantity = book.quantity + 1;
    await book.save();

    response.status(200).json({
      status: 'success',
      message: 'Book returned successfully',
    });
  } catch (error) {
    response.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
