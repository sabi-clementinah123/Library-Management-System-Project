import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    if (!membershipId.trim() || !password) {
      alert("Please enter your membership ID and password.");
      return;
    }

    fetch("http://localhost:5000/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        membership_id: membershipId,
        password: password,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        return data;
      })
      .then((data) => {
        alert(data.message);

        sessionStorage.setItem(
          "loggedInUser",
          JSON.stringify(data.user)
        );

        navigate("/");
      })
      .catch((error) => alert(error.message));
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-decoration">✿</div>

        <h1>नमस्ते</h1>

        <h2>Library Management System</h2>

        <p className="login-subtitle">
          Welcome! Sign in to explore your library.
        </p>

        <div className="gold-divider">✧ ❖ ✧</div>

        <form onSubmit={handleLogin} className="login-form">

          <label>Membership ID</label>

          <input
            type="text"
            placeholder="Enter your membership ID"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Sign In
          </button>

        </form>

        <p className="login-footer">
          Welcome to a world of knowledge ✨
        </p>

      </div>
    </div>
  );
}

export default Login;