import pool from "../config/database.js";
import { hashPassword } from "../utils/passwordUtils.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        // console.log(existingUser);

        // If user exists, return error
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPwd = await hashPassword(password);

        // Insert user into database
        const [user] = await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPwd]
        );
        // console.log('register', user);

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