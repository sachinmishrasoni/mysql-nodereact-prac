import pool from "../config/database.js";

export const createNotebook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, color } = req.body || {};

        if (!title) {
            return res.status(400).json({ message: "Title is required." });
        }

        const [result] = await pool.query(
            "INSERT INTO notebooks (user_id, title, description, color) VALUES (?, ?, ?, ?)",
            [userId, title, description ?? "", color ?? "#fff"]
        );

        const [notebook] = await pool.query(
            "SELECT id, user_id, title, description, color, created_at, updated_at FROM notebooks WHERE id = ?",
            [result.insertId]
        );

        res.status(200).json({
            message: "Notebook created successfully.",
            data: notebook[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllNotebooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const [notebooks] = await pool.query(
            "SELECT id, user_id, title, description, color, created_at, updated_at FROM notebooks WHERE user_id = ? AND is_deleted = false ORDER BY created_at DESC",
            [userId]
        );

        if (notebooks.length === 0) {
            return res.status(404).json({ message: "Notebooks not found." });
        }

        res.status(200).json({
            message: "Notebooks retrieved successfully.",
            data: notebooks
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getNotebookById = async (req, res) => {
    try {
        const userId = req.user.id;
        const notebookId = req.params.id;

        const [notebook] = await pool.query(
            "SELECT id, user_id, title, description, color, created_at, updated_at FROM notebooks WHERE user_id = ? AND id = ? AND is_deleted = false",
            [userId, notebookId]
        );

        if (notebook.length === 0) {
            return res.status(404).json({ message: "Notebook not found." });
        }

        res.status(200).json({
            message: "Notebook retrieved successfully.",
            data: notebook[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

