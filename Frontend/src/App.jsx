
import React from "react";
import { useState, useEffect } from "react";

function App() {
  const [val, setVal] = useState("");
  const [todo, setTodo] = useState([]);
  const [editId, setEditId] = useState(null);
  const [description, setDescription] = useState("");

  // Common backend URL
  const API_URL = import.meta.env.VITE_API_URL;

  // GET - Fetch all Todos
  useEffect(() => {
    async function getTodos() {
      try {
        const response = await fetch(`${API_URL}/todos`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch Todos");
        }

        setTodo(data.message);
      } catch (error) {
        console.log("Error:", error);
      }
    }

    getTodos();
  }, []);

  // POST - Add Todo to MongoDB
  async function handleSubmit(e) {
    e.preventDefault();

    if (!val.trim() || !description.trim()) return;

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: val,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      // Refresh Todos
      const result = await fetch(`${API_URL}/todos`);
      const todoData = await result.json();

      if (!result.ok) {
        throw new Error("Failed to refresh Todos");
      }

      setTodo(todoData.message);
      setVal("");
      setDescription("");
    } catch (error) {
      console.log("Error:", error);
    }
  }

  // DELETE - Delete Todo from MongoDB
  async function handledelete(id) {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      setTodo((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.log("Error:", error);
    }
  }

  // UPDATE - Update Todo in MongoDB
  async function handleUpdate(e) {
    e.preventDefault();

    if (!val.trim() || !description.trim()) return;

    try {
      const response = await fetch(`${API_URL}/todos/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: val,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      setTodo((prev) =>
        prev.map((item) =>
          item._id === editId ? data.data : item
        )
      );

      setVal("");
      setDescription("");
      setEditId(null);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  // COMPLETE - Update completed status in MongoDB
  async function handleComplete(id) {
    const selectedTodo = todo.find((item) => item._id === id);

    if (!selectedTodo) return;

    const updatedCompleted = !selectedTodo.completed;

    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedTodo.title,
          description: selectedTodo.description,
          completed: updatedCompleted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      setTodo((prev) =>
        prev.map((item) =>
          item._id === id ? data.data : item
        )
      );
    } catch (error) {
      console.log("Error:", error);
    }
  }

  // EDIT - Load selected Todo into inputs
  function handleEdit(item) {
    setVal(item.title);
    setDescription(item.description);
    setEditId(item._id);
  }

  return (
    <>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Please enter task"
      />

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description"
      />

      <button
        type="button"
        onClick={editId !== null ? handleUpdate : handleSubmit}
      >
        {editId !== null ? "Update Todo" : "Add Todo"}
      </button>

      <ul>
        {todo.map((item) => (
          <li key={item._id}>
            {item.title} - {item.description}

            <button onClick={() => handledelete(item._id)}>
              Delete
            </button>

            <button onClick={() => handleComplete(item._id)}>
              {item.completed ? "Done" : "Complete"}
            </button>

            <button onClick={() => handleEdit(item)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
