import pool from "../config/database.js";

export const createNote = async (req, res) => {
    try {
        const userId = req.user.id;
        const notebookId = req.params.notebookId;

        const { title, content } = req.body || {};

        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        const [notebook] = await pool.query(
            "SELECT * FROM notebooks WHERE user_id = ? AND id = ? AND is_deleted = false",
            [userId, notebookId]
        );

        if (notebook.length === 0) {
            return res.status(404).json({ message: "Notebook not found." });
        }

        const [result] = await pool.query(
            "INSERT INTO notes (user_id, notebook_id, title, content) VALUES (?, ?, ?, ?)",
            [userId, notebookId, title, content]
        )

        const [note] = await pool.query(
            "SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE id = ?",
            [result.insertId]
        )

        res.status(200).json(
            {
                message: "Note created successfully.",
                data: note[0]
            }
        )
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id;
        const notebookId = req.params.notebookId;

        const [notes] = await pool.query(
            "SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE user_id = ? AND notebook_id = ? AND is_deleted = false ORDER BY created_at DESC",
            [userId, notebookId]
        );

        if (notes.length === 0) {
            return res.status(404).json({ message: "Notes not found." });
        }

        res.status(200).json({
            message: "Notes retrieved successfully.",
            data: notes
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
 };
export const getNoteById = async (req, res) => { 
    try {
        const userId = req.user.id;
        const notebookId = req.params.notebookId;
        const noteId = req.params.noteId;

        const [note] = await pool.query(
            "SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE user_id = ? AND notebook_id = ? AND id = ? AND is_deleted = false",
            [userId, notebookId, noteId]
        );

        if (note.length === 0) {
            return res.status(404).json({ message: "Note not found." });
        }

        res.status(200).json({
            message: "Note retrieved successfully.",
            data: note[0]
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const updateNote = async (req, res) => { 
    try {
        const userId = req.user.id;
        const notebookId = req.params.notebookId;
        const noteId = req.params.noteId;

        const { title, content, isPinned } = req.body || {};

        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        const [note] = await pool.query(
            "SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE user_id = ? AND notebook_id = ? AND id = ? AND is_deleted = false",
            [userId, notebookId, noteId]
        );

        if (note.length === 0) {
            return res.status(404).json({ message: "Note not found." });
        }

        await pool.query(
            "UPDATE notes SET title = ?, content = ?, is_pinned = ? WHERE user_id = ? AND notebook_id = ? AND id = ?",
            [title, content, isPinned, userId, notebookId, noteId]
        );

        const [updatedNote] = await pool.query(
            "SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE id = ?",
            [noteId]
        )

        res.status(200).json({
            message: "Note updated successfully.",
            data: updatedNote[0]
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const deleteNote = async (req, res) => {
    try {
        const userId = req.user.id;
        const notebookId = req.params.notebookId;
        const noteId = req.params.noteId;

        const [note] = await pool.query(
            "SELECT id, title, content, is_pinned, created_at, updated_at FROM notes WHERE user_id = ? AND notebook_id = ? AND id = ? AND is_deleted = false",
            [userId, notebookId, noteId]
        );

        if (note.length === 0) {
            return res.status(404).json({ message: "Note not found." });
        }

        await pool.query(
            "UPDATE notes SET is_deleted = true WHERE user_id = ? AND notebook_id = ? AND id = ?",
            [userId, notebookId, noteId]
        );

        res.status(200).json({
            message: "Note deleted successfully.",
            data: {
                id: noteId
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message }); 
    }
 };