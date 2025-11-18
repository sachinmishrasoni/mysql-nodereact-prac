import express from "express";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "../controllers/note.controller.js";

const noteRouter = express.Router();

noteRouter.post("/:notebookId", createNote);
noteRouter.get("/:notebookId", getAllNotes);
noteRouter.get("/:notebookId/:noteId", getNoteById);
noteRouter.put("/:notebookId/:noteId", updateNote);
noteRouter.delete("/:notebookId/:noteId", deleteNote);

export default noteRouter;