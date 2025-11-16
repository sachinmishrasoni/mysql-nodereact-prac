import pool from "../config/database.js";

// Create todo
export const createTodo = async (req, res) => {
    try {
        const { title, description, due_date, status, priority } = req.body || {};
        const user_id = 2;

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
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get todo by id
export const getTodoById = async (req, res) => {
    try {
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update todo by id
export const updateTodoById = async (req, res) => {
    try {
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete todo by id
export const deleteTodoById = async (req, res) => {
    try {
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
