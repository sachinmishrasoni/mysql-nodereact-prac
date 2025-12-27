import pool from "../config/database.js";

export const createComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;
        const { comment, parent_id = null } = req.body || {};

        if (!comment) {
            return res.status(400).json({ message: "Comment is required" });
        }

        const [post] = await pool.query(
            "SELECT * FROM posts WHERE id = ? AND is_deleted = false",
            [postId]
        );

        if (post.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const [result] = await pool.query(
            "INSERT INTO comments (user_id, post_id, comment, parent_id) VALUES (?, ?, ?, ?)",
            [userId, postId, comment, parent_id]
        );

        res.status(201).json({
            message: "Comment created successfully",
            data: {
                id: result.insertId,
                comment,
                parent_id
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const [comments] = await pool.query(`
            SELECT 
                c.id,
                c.comment,
                c.parent_id,
                c.created_at,
                u.id AS user_id,
                u.name AS user_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
              AND c.is_deleted = false
            ORDER BY c.created_at ASC
        `, [postId]);

        const formattedComments = comments.map(comment => ({
            id: comment.id,
            comment: comment.comment,
            parent_id: comment.parent_id,
            created_at: comment.created_at,
            user: {
                id: comment.user_id,
                name: comment.user_name
            }
        }));

        if (formattedComments.length === 0) {
            return res.status(404).json({ message: "Comments not found" });
        }

        res.status(200).json({
            message: "Comments retrieved successfully",
            data: formattedComments
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const updateComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;
        const { comment } = req.body || {};

        if (!comment) {
            return res.status(400).json({ message: "Comment is required" });
        }

        const [existing] = await pool.query(
            `SELECT id FROM comments
             WHERE id = ? AND user_id = ? AND is_deleted = false`,
            [commentId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await pool.query(
            "UPDATE comments SET comment = ? WHERE id = ?",
            [comment, commentId]
        );

        res.status(200).json({
            message: "Comment updated successfully",
            data: { id: commentId }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const deleteComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;

        const [existing] = await pool.query(
            `SELECT id FROM comments
             WHERE id = ? AND user_id = ? AND is_deleted = false`,
            [commentId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await pool.query(
            "UPDATE comments SET is_deleted = true WHERE id = ?",
            [commentId]
        );

        res.status(200).json({
            message: "Comment deleted successfully",
            data: { id: commentId }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

