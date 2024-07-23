// book.test.js
const Book = require("../models/books");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("Book.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all books from the database", async () => {
    const mockBooks = [
      {
        id: 1,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        availability: "Y",
      },
      {
        id: 2,
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        availability: "N",
      },
    ];

    const mockRequest = {
      query: jest.fn().mockResolvedValue({ recordset: mockBooks }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const books = await Book.getAllBooks();

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(books).toHaveLength(2);
    expect(books[0]).toBeInstanceOf(Book);
    expect(books[0].title).toBe("The Lord of the Rings");
    expect(books[0].author).toBe("J.R.R. Tolkien");
    expect(books[0].availability).toBe("Y");
    expect(books[1]).toBeInstanceOf(Book);
    expect(books[1]).toBeInstanceOf(Book);
    expect(books[1].title).toBe("The Hitchhiker's Guide to the Galaxy");
    expect(books[1].author).toBe("Douglas Adams");
    expect(books[1].availability).toBe("N");
  });

  it("should handle errors when retrieving books", async () => {
    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage));
    await expect(Book.getAllBooks()).rejects.toThrow(errorMessage);
  });
});

describe("Book.updateBookAvailability", () => {
  let mockPool;
  let mockRequest;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    mockPool = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn(),
    };

    sql.connect.mockResolvedValue(mockPool);
  });

  it("should update the availability of a book", async () => {
    const mockUpdatedBook = {
      book_id: 1,
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      availability: "N",
    };

    mockRequest.query.mockResolvedValueOnce({ rowsAffected: [1] });
    
    // Mock the getBookById method
    jest.spyOn(Book, 'getBookById').mockResolvedValue(mockUpdatedBook);

    const updatedBook = await Book.updateBookAvailability(1, "N");

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockPool.request).toHaveBeenCalledTimes(1);
    expect(mockRequest.input).toHaveBeenCalledWith("availability", "N");
    expect(mockRequest.input).toHaveBeenCalledWith("book_id", 1);
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE Books"));
    expect(mockPool.close).toHaveBeenCalledTimes(1);
    expect(Book.getBookById).toHaveBeenCalledWith(1);
    expect(updatedBook).toEqual(mockUpdatedBook);
  });

  it("should return null if book with the given id does not exist", async () => {
    mockRequest.query.mockResolvedValueOnce({ rowsAffected: [0] });
    
    // Mock the getBookById method to return null
    jest.spyOn(Book, 'getBookById').mockResolvedValue(null);

    const updatedBook = await Book.updateBookAvailability(999, "N");

    expect(updatedBook).toBeNull();
  });

  it("should handle errors when updating books", async () => {
    const errorMessage = "Error in book.js Could not update book availability";
    mockRequest.query.mockRejectedValue(new Error(errorMessage));

    await expect(Book.updateBookAvailability(1, "N")).rejects.toThrow(errorMessage);
    expect(mockPool.close).toHaveBeenCalledTimes(1);
  });
});