import { useState, useEffect } from "react";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);

  const [bookId, setBookId] = useState("");
  const [userId, setUserId] = useState("");
  const [transactionType, setTransactionType] = useState("Borrow");
  const [quantity, setQuantity] = useState(1);

  function fetchTransactions() {
    fetch("http://localhost:5000/transactions")
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Error fetching transactions:", error));
  }

  function fetchBooks() {
    fetch("http://localhost:5000/books")
      .then((response) => response.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Error fetching books:", error));
  }

  function fetchUsers() {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }

  useEffect(() => {
    fetchTransactions();
    fetchBooks();
    fetchUsers();
  }, []);

  function recordTransaction(e) {
    e.preventDefault();

    if (!bookId || !userId || !quantity || Number(quantity) < 1) {
      alert("Please fill in all fields.");
      return;
    }

    const transactionData = {
      book_id: Number(bookId),
      user_id: Number(userId),
      transaction_type: transactionType,
      quantity: Number(quantity),
    };

    fetch("http://localhost:5000/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Transaction failed.");
        }

        return data;
      })
      .then((data) => {
        alert(data.message);

        setBookId("");
        setUserId("");
        setTransactionType("Borrow");
        setQuantity(1);

        fetchTransactions();
        fetchBooks();
      })
      .catch((error) => alert(error.message));
  }

  return (
    <div>
      <h1>Transactions</h1>
      <p>Record borrowed and returned books.</p>

      <form onSubmit={recordTransaction}>
        <select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
        >
          <option value="">Select Book</option>
          {books.map((book) => (
            <option key={book.book_id} value={book.book_id}>
              {book.title} (Available: {book.quantity})
            </option>
          ))}
        </select>

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.name} ({user.membership_id})
            </option>
          ))}
        </select>

        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
        >
          <option value="Borrow">Borrow</option>
          <option value="Return">Return</option>
        </select>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />

        <button type="submit">Record Transaction</button>
      </form>

      <h2>Transaction History</h2>

      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>User</th>
            <th>Membership ID</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.transaction_id}>
              <td>{transaction.title}</td>
              <td>{transaction.name}</td>
              <td>{transaction.membership_id}</td>
              <td>{transaction.transaction_type}</td>
              <td>{transaction.quantity}</td>
              <td>
                {new Date(transaction.transaction_date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions;