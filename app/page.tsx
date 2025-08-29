"use client";

import { useState, useEffect } from "react";
import { Todo, User } from "./api/graphql/route";

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newText, setNewText] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");

  // Fetch todos
  const fetchTodos = async () => {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            todos {
              id
              text
              done
              owner {
                id
                name
              }
            }
          }
        `,
      }),
    });
    const json = await res.json();
    setTodos(json.data.todos);
  };

  // Fetch users (simulate fetching from DB)
  const fetchUsers = async () => {
    // We can hardcode users since it's in-memory, or expose a users query in GraphQL
    setUsers([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ]);
    setSelectedOwner("1"); // default owner
  };

  // Add todo
  const addTodo = async () => {
    if (!newText.trim() || !selectedOwner) return;

    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation($text: String!, $ownerId: ID!) {
            addTodo(text: $text, ownerId: $ownerId) {
              id
              text
              done
              owner {
                id
                name
              }
            }
          }
        `,
        variables: { text: newText, ownerId: selectedOwner },
      }),
    });
    const json = await res.json();
    setTodos((prev) => [...prev, json.data.addTodo]);
    setNewText("");
  };

  useEffect(() => {
    fetchUsers();
    fetchTodos();
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <h1 className="text-xl font-bold">GraphQL Todo List</h1>

      <div className="flex gap-2">
        <input
          className="bg-white text-black px-2"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New todo"
        />
        <select
          className="bg-white text-black px-2"
          value={selectedOwner}
          onChange={(e) => setSelectedOwner(e.target.value)}>
          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-500 text-white px-4"
          onClick={addTodo}>
          Add
        </button>
      </div>

      <ul className="w-full max-w-md">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="bg-amber-100 text-black px-4 py-2 my-2 flex justify-between">
            <span>
              {todo.text} {todo.done ? "✅" : ""}
            </span>
            <span className="italic text-sm">— {todo.owner.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
