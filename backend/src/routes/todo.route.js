import express from "express";
import { createTodo, deleteTodoById, getAllTodos, getTodoById, updateTodoById } from "../controllers/todo.controller.js";

const todoRouter = express.Router();

todoRouter.post("/", createTodo);
todoRouter.get("/", getAllTodos);
todoRouter.get("/:id", getTodoById);
todoRouter.put("/:id", updateTodoById);
todoRouter.delete("/:id", deleteTodoById);

export default todoRouter;