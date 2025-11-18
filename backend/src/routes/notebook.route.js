import express from "express";
import { createNotebook, getAllNotebooks, getNotebookById } from "../controllers/notebook.controller.js";

const notebookRouter = express.Router();

// Notebook routes
notebookRouter.post('/', createNotebook);
notebookRouter.get('/', getAllNotebooks);
notebookRouter.get('/:id', getNotebookById);
notebookRouter.put('/:id', createNotebook);
notebookRouter.delete('/:id', createNotebook);

export default notebookRouter;
