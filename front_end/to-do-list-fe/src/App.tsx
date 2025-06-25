// App.tsx
import { useState, useEffect, useRef } from "react";
import type { Todo } from "./types/interfaces";
import "./App.css";

function App() {
  const [addList, setAddList] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const fetchTodos = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/getToDoList");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addToDo = async () => {
    if (addList.trim() !== "") {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/addToDoList", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task: addList }),
        });

        const newTodo = await res.json();
        setTodos([...todos, newTodo]);
        setAddList("");
      } catch (error) {
        console.error("Error:", error);
        alert("Error adding todo");
      }
    } else {
      alert("Please enter a task");
    }
  };

  const updateToDoStatus = async (id: number, completed: boolean) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/updateToDoList/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo)));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateTodoText = async (id: number, newText: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/updateToDoList/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newText }),
      });

      const updatedTodo = await response.json();
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error("Error updating text:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/deleteToDoList/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="glass-card">
        <div className="header">
          <h1 className="app-title">
            Mini<span className="highlight">ToDo</span>
          </h1>
          <div className="input-container">
            <input type="text" value={addList} onChange={(e) => setAddList(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToDo()} placeholder="Add a new task..." className="task-input" />
            <button onClick={addToDo} className="add-button">
              <span className="plus-icon">+</span> Add
            </button>
          </div>
        </div>

        <div className="todo-list-container">
          {todos.length === 0 ? (
            <div className="empty-state">
              <div className="holographic-icon">📋</div>
              <h3>Your to-do list is empty</h3>
              <p>Add a task to get started</p>
            </div>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  {editingId === todo.id ? (
                    <div className="edit-container">
                      <input
                        ref={inputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateTodoText(todo.id, editText);
                            setEditingId(null);
                          }
                        }}
                        autoFocus
                        className="edit-input"
                      />
                      <div className="edit-buttons">
                        <button
                          onClick={() => {
                            updateTodoText(todo.id, editText);
                            setEditingId(null);
                          }}
                          className="save-button"
                        >
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="cancel-button">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="todo-content">
                      <label className="task-container">
                        <input type="checkbox" checked={todo.completed} onChange={() => updateToDoStatus(todo.id, !todo.completed)} className="hidden-checkbox" />
                        <span className={`custom-checkbox ${todo.completed ? "checked" : ""}`}>{todo.completed && <span className="check-icon">✓</span>}</span>
                        <span className={`todo-text ${todo.completed ? "completed" : ""}`}>{todo.task}</span>
                      </label>
                      <div className="todo-actions">
                        <button
                          onClick={() => {
                            setEditingId(todo.id);
                            setEditText(todo.task);
                          }}
                          className="edit-button"
                        >
                          <span className="icon">✎</span>
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className="delete-button">
                          <span className="icon">🗑️</span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="stats-bar">
          <span>{todos.length} tasks</span>
          <span>{todos.filter((t) => t.completed).length} completed</span>
        </div>
      </div>
    </div>
  );
}

export default App;
