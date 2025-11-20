import express from "express";
import { createNotebook, deleteNotebook, getAllNotebooks, getNotebookById, updateNotebook } from "../controllers/notebook.controller.js";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "../controllers/note.controller.js";

const notebookRouter = express.Router();

// Notebook routes
notebookRouter.post('/', createNotebook);
notebookRouter.get('/', getAllNotebooks);
notebookRouter.get('/:id', getNotebookById);
notebookRouter.put('/:id', updateNotebook);
notebookRouter.delete('/:id', deleteNotebook);

// Note routes
notebookRouter.post('/:notebookId/notes', createNote);
notebookRouter.get('/:notebookId/notes', getAllNotes);
notebookRouter.get('/:notebookId/notes/:noteId', getNoteById);
notebookRouter.put('/:notebookId/notes/:noteId', updateNote);
notebookRouter.delete('/:notebookId/notes/:noteId', deleteNote);

export default notebookRouter;
