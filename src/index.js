const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "Todo does not exists",
    });
  }

  request.user = user;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.find(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({
      error: "Username already exists",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const userTasks = user.todos;

  return response.status(200).json(userTasks);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const task = user.todos.find((task) => task.id === id);

  if (!task) {
    return response.status(404).json({
      error: "Task does not exists!",
    });
  }

  Object.assign(task, {
    title,
    deadline: new Date(deadline),
  });

  return response.json(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find((task) => task.id === id);

  if (!task) {
    return response.status(404).json({
      error: "Task does not exists!",
    });
  }

  Object.assign(task, {
    done: true,
  });

  return response.json(task);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find((task) => task.id === id);

  if (!task) {
    return response.status(404).json({
      error: "Task does not exists!",
    });
  }

  const tasksWithoutRemovedTask = user.todos.filter(
    (userTask) => userTask.id !== task.id
  );

  user.todos = tasksWithoutRemovedTask;

  return response.status(204).json(tasksWithoutRemovedTask);
});

module.exports = app;
