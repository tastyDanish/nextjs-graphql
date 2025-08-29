import { createYoga, createSchema } from "graphql-yoga";

// Types
export type User = { id: string; name: string };
export type Todo = { id: string; text: string; done: boolean; owner: User };

// In-memory data
const users: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const todos: Todo[] = [];

// GraphQL schema
const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
  }

  type Todo {
    id: ID!
    text: String!
    done: Boolean!
    owner: User!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
    users: [User!]!
  }

  type Mutation {
    addTodo(text: String!, ownerId: ID!): Todo!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    todos: () => todos,
    todo: (_parent: unknown, { id }: { id: string }) =>
      todos.find((t) => t.id === id),
    users: () => users,
  },
  Mutation: {
    addTodo: (
      _parent: unknown,
      { text, ownerId }: { text: string; ownerId: string }
    ) => {
      const owner = users.find((u) => u.id === ownerId);
      if (!owner) throw new Error("Owner not found");

      const todo: Todo = {
        id: (todos.length + 1).toString(),
        text,
        done: false,
        owner,
      };
      todos.push(todo);
      return todo;
    },
  },
};

// Create Yoga server
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
});

// App Router exports
export const GET = yoga;
export const POST = yoga;
