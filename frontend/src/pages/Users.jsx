import { useState, useEffect } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [role, setRole] = useState("Student");
  const [password, setPassword] = useState("");

  const [editingId, setEditingId] = useState(null);

  function fetchUsers() {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function saveUser(e) {
    e.preventDefault();

    if (!name.trim() || !membershipId.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!editingId && !password.trim()) {
      alert("Please create a password for this user.");
      return;
    }

    const userData = {
      name,
      membership_id: membershipId,
      role,
      password,
    };

    fetch(
      editingId
        ? `http://localhost:5000/users/${editingId}`
        : "http://localhost:5000/users",
      {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        fetchUsers();

        setName("");
        setMembershipId("");
        setRole("Student");
        setPassword("");
        setEditingId(null);
      })
      .catch((error) => console.error("Error saving user:", error));
  }

  function editUser(user) {
    setEditingId(user.user_id);
    setName(user.name);
    setMembershipId(user.membership_id);
    setRole(user.role);
    setPassword("");
  }

  function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    fetch(`http://localhost:5000/users/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        fetchUsers();
      })
      .catch((error) => console.error("Error deleting user:", error));
  }

  return (
    <div>
      <h1>User Management</h1>
      <p>Register and manage library users.</p>

      <form onSubmit={saveUser}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Membership ID"
          value={membershipId}
          onChange={(e) => setMembershipId(e.target.value)}
        />

        <input
          type="password"
          placeholder={
            editingId
              ? "New Password (leave blank to keep current)"
              : "Create Password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Student">Student</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit">
          {editingId ? "Update User" : "Register User"}
        </button>
      </form>

      <h2>Registered Users</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.name}</td>
              <td>{user.membership_id}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => editUser(user)}>
                  Edit
                </button>

                <button onClick={() => deleteUser(user.user_id)}>
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

export default Users;