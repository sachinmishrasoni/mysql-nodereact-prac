import pool from "../config/database.js";
import { comparePassword, hashPassword } from "../utils/passwordUtils.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body || {};

        // Check if all fields are provided
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Name, username, email, and password fields are required" });
        }

        // Check if user already exists
        const [existingUser] = await pool.query(
            "SELECT * FROM users WHERE email = ? or username = ?",
            [email, username]);

        // If user exists, return error
        // if (existingUser.length > 0) {
        //     return res.status(400).json({ message: "User already exists" });
        // }

        if (existingUser.length > 0) {
            const user = existingUser[0];

            if (user.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            }

            if (user.username === username) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        // Hash password
        const hashedPwd = await hashPassword(password);

        // Insert user into database
        const [user] = await pool.query(
            "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)",
            [name, username, email, hashedPwd]
        );

        // Return success message
        res.status(201).json({
            message: "User registered successfully",
            data: {
                id: user.insertId,
                name: name,
                email: email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

export const login = async (req, res) => {
    const { username, email, password } = req.body || {};

    // Check if all fields are provided
    if ((!email && !username) || !password) {
        return res.status(400).json({
            message: "Username or email and password are required"
        });
    }

    // Find user by email OR username
    const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
        [email, username]
    );

    if (users.length === 0) {
        return res.status(401).json({ message: "Invalid email/username or password" });
    }

    const user = users[0];

    // Compare password
    const isMatch = await comparePassword(password, user.password);

    // If password doesn't match, return error
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email/username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    )

    // Return success message
    res.status(200).json({
        message: "Login successful",
        token
    });
};
