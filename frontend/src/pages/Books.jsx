import { useState, useEffect } from "react";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editingId, setEditingId] = useState(null);

  // Get books from MySQL
  function fetchBooks() {
    fetch("http://localhost:5000/books")
      .then((response) => response.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Error fetching books:", error));
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // Add a book to MySQL
  function addBook(e) {
    e.preventDefault();

    if (!title.trim() || !author.trim() || !isbn.trim() || quantity === "") {
      alert("Please fill in all required fields.");
      return;
    }

    if (Number(quantity) < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    const newBook = {
      title,
      author,
      genre,
      isbn,
      quantity: Number(quantity),
    };

    fetch(
      editingId
        ? `http://localhost:5000/books/${editingId}`
        : "http://localhost:5000/books",
      {
        method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBook),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        fetchBooks();

        setTitle("");
        setAuthor("");
        setGenre("");
        setIsbn("");
        setQuantity("");
        setEditingId(null);
      })
      .catch((error) => console.error("Error adding book:", error));
  }

  // Edit a book
function editBook(book) {
  
  setEditingId(book.book_id);
  setTitle(book.title);
  setAuthor(book.author);
  setGenre(book.genre || "");
  setIsbn(book.isbn);
  setQuantity(book.quantity.toString());
}

  // Delete a book from MySQL
  function deleteBook(id) {
    fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        fetchBooks();
      })
      .catch((error) => console.error("Error deleting book:", error));
  }

  return (
    <div>
      <h1>Book Management</h1>
      <p>Add, view and manage library books.</p>

      <form className="book-form" onSubmit={addBook}>
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />

        <input
          type="text"
          placeholder="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Initial Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

<button type="submit">
  {editingId ? "Update Book" : "Add Book"}
</button>
      </form>

      <h2>Book List</h2>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {books.map((book) => (
            <tr key={book.book_id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.isbn}</td>
              <td>{book.quantity}</td>
              <td>
  <button onClick={() => editBook(book)}>
    Edit
  </button>

  <button onClick={() => deleteBook(book.book_id)}>
    Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Books;