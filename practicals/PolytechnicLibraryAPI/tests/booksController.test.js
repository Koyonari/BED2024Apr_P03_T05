// booksController.test.js

const booksController = require("../controllers/booksController");
const Book = require("../models/books");

// Mock the Book model
jest.mock("../models/books.js"); // Replace with the actual path to your Book model

describe("booksController.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it("should fetch all books and return a JSON response", async () => {
    const mockBooks = [
      { id: 1, title: "The Lord of the Rings" },
      { id: 2, title: "The Hitchhiker's Guide to the Galaxy" },
    ];

    // Mock the Book.getAllBooks function to return the mock data
    Book.getAllBooks.mockResolvedValue(mockBooks);

    const req = {};
    const res = {
      json: jest.fn(), // Mock the res.json function
    };

    await booksController.getAllBooks(req, res);

    expect(Book.getAllBooks).toHaveBeenCalledTimes(1); // Check if getAllBooks was called
    expect(res.json).toHaveBeenCalledWith(mockBooks); // Check the response body
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database error";
    Book.getAllBooks.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await booksController.getAllBooks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error retrieving books");
  });
});

describe("booksController.updateBookAvailability", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  it("should update book availability and return the updated book", async () => {
    const mockBook = { id: 1, title: "The Lord of the Rings", availability: true };
    const req = {
      params: { bookId: 1 },
      body: { availability: false },
    };
    const res = {
      json: jest.fn(), // Mock the res.json function
    };

    // Mock the Book.updateBookAvailability function to return the updated mock data
    Book.updateBookAvailability.mockResolvedValue({ ...mockBook, availability: false });

    await booksController.updateBookAvailability(req, res);

    expect(Book.updateBookAvailability).toHaveBeenCalledWith(1, false); // Check if updateBookAvailability was called
    expect(res.json).toHaveBeenCalledWith({ ...mockBook, availability: false }); // Check the response body
  });

  it("should return 404 if the book is not found", async () => {
    const req = {
      params: { bookId: 1 },
      body: { availability: false },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock the Book.updateBookAvailability function to return null
    Book.updateBookAvailability.mockResolvedValue(null);

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("Book not found");
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database error";
    const req = {
      params: { bookId: 1 },
      body: { availability: false },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock the Book.updateBookAvailability function to throw an error
    Book.updateBookAvailability.mockRejectedValue(new Error(errorMessage));

    await booksController.updateBookAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Error updating book availability");
  });
});
