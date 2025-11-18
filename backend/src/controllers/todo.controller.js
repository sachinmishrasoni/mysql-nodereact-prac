import pool from "../config/database.js";
import { buildUpdateQuery } from "../utils/buildUpdateQuery.js";

// Create todo
export const createTodo = async (req, res) => {
    try {
        const { title, description, due_date, status, priority } = req.body || {};

        const user_id = req.user.id;

        if (!title || !description || !due_date || !status || !priority) {
            return res.status(400).json({ message: "Title, description, due date, status, and priority fields are required." });
        }

        // Create todo
        const [result] = await pool.query(
            "INSERT INTO todos (user_id, title, description, due_date, status, priority) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, title, description, due_date, status, priority]
        );

        const todo = {
            id: result.insertId,
            title,
            description,
            due_date,
            status,
            priority,
        };

        res.status(201).json({
            message: "Todo created successfully",
            data: todo
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all todos
export const getAllTodos = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [todos] = await pool.query("SELECT * FROM todos WHERE user_id = ?", [user_id]);

        res.status(200).json({
            message: "Todos retrieved successfully.",
            data: todos
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get todo by id
export const getTodoById = async (req, res) => {
    try {
        const user_id = req.user.id;
        const todo_id = req.params.id;

        const [todo] = await pool.query("SELECT * FROM todos WHERE user_id = ? AND id = ?", [user_id, todo_id]);

        if (todo.length === 0) {
            return res.status(404).json({ message: "Todo not found." });
        }

        res.status(200).json({
            message: "Todo retrieved successfully.",
            data: todo[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update todo by id
export const updateTodoById = async (req, res) => {
    try {
        const user_id = req.user.id;
        const todo_id = req.params.id;
        // const { title, description, due_date, status, priority } = req.body || {};

        const fieldsToUpdate = req.body;

        const [existingTodo] = await pool.query(
            "SELECT * FROM todos WHERE user_id = ? AND id = ?",
            [user_id, todo_id]
        );

        if (existingTodo.length === 0) {
            return res.status(404).json({ message: "Todo not found." });
        }

        // Update todo
        // await pool.query(
        //     "UPDATE todos SET title = ?, description = ?, due_date = ?, status = ?, priority = ? WHERE user_id = ? AND id = ?",
        //     [title, description, due_date, status, priority, user_id, todo_id]
        // )

        // Build update query using utility
        const { sql, values } = buildUpdateQuery(
            "todos",
            fieldsToUpdate,
            { user_id, id: todo_id }
        );

        if (!sql) {
            return res.status(400).json({ message: "No fields provided to update." });
        }

        // Perform update
        await pool.query(sql, values);

        // Get updated data
        const [updatedTodo] = await pool.query(
            "SELECT * FROM todos WHERE user_id = ? AND id = ?",
            [user_id, todo_id]
        );

        res.status(200).json({
            message: "Todo updated successfully.",
            // data: {
            //     id: todo_id,
            //     title,
            //     description,
            //     due_date,
            //     status,
            //     priority
            // }
            data: updatedTodo[0]
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete todo by id
export const deleteTodoById = async (req, res) => {
    try {
        const user_id = req.user.id;
        const todo_id = req.params.id;

        const [existingTodo] = await pool.query(
            "SELECT * FROM todos WHERE user_id = ? AND id = ?",
            [user_id, todo_id]
        );

        if (existingTodo.length === 0) {
            return res.status(404).json({ message: "Todo not found." });
        }

        // Delete todo
        await pool.query("DELETE FROM todos WHERE user_id = ? AND id = ?", [user_id, todo_id]);

        res.status(200).json({
            message: "Todo deleted successfully.",
            data: {
                id: todo_id
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
