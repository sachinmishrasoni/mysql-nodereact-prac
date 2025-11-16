import express from "express";
import { createTodo } from "../controllers/todo.controller.js";

const todoRouter = express.Router();

todoRouter.post("/", createTodo);

export default todoRouter;