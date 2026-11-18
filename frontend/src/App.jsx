import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from "react-router-dom";

import "./App.css";

import Books from "./pages/Books";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";

// Dashboard
function Dashboard() {
  const [totalBooks, setTotalBooks] = useState(0);
  const [availableBooks, setAvailableBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [lowStockBooks, setLowStockBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/books")
      .then((response) => response.json())
      .then((data) => {
        setTotalBooks(data.length);

        const available = data.reduce(
          (total, book) => total + Number(book.quantity),
          0
        );

        setAvailableBooks(available);

        setLowStockBooks(
          data.filter((book) => Number(book.quantity) < 2)
        );
      });

    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => setTotalUsers(data.length));

    fetch("http://localhost:5000/transactions")
      .then((response) => response.json())
      .then((data) => setTotalTransactions(data.length));
  }, []);

  return (
    <div>
     
     <h1>Dashboard</h1>

<div className="royal-welcome">
  <div>
    <span className="welcome-label">
      ✧ WELCOME TO YOUR LIBRARY ✧
    </span>

    <h2>Knowledge is the Greatest Treasure</h2>

    <p>
      Discover, manage and explore a world of knowledge.
      Your library journey begins here.
    </p>
  </div>

  <div className="welcome-symbol">❖</div>
</div>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Books</h3>
          <p>{totalBooks}</p>
        </div>

        <div className="card">
          <h3>Available Books</h3>
          <p>{availableBooks}</p>
        </div>

        <div className="card">
          <h3>Registered Users</h3>
          <p>{totalUsers}</p>
        </div>

        <div className="card">
          <h3>Transactions</h3>
          <p>{totalTransactions}</p>
        </div>
      </div>

      <h2>Low Stock Books</h2>

      {lowStockBooks.length === 0 ? (
        <p>No books are currently low in stock.</p>
      ) : (
        <ul>
          {lowStockBooks.map((book) => (
            <li key={book.book_id}>
              {book.title} - Only {book.quantity} available
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Protect pages that require login
function AppLayout() {
  const location = useLocation();

  const loggedInUser = JSON.parse(
    sessionStorage.getItem("loggedInUser") || "null"
  );

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  function logout() {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "/login";
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Library System</h2>

        <p>
          Welcome, {loggedInUser.name}
        </p>

        <p>
          Role: {loggedInUser.role}
        </p>

        <nav>
          <Link to="/">Dashboard</Link>

          <Link to="/books">Book Management</Link>

          <Link to="/transactions">Transactions</Link>

          {loggedInUser.role === "Admin" && (
            <Link to="/users">User Management</Link>
          )}

          <button onClick={logout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/books" element={<Books />} />

          <Route path="/transactions" element={<Transactions />} />

          <Route
            path="/users"
            element={
              loggedInUser.role === "Admin"
                ? <Users />
                : <Navigate to="/" replace />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />


        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


