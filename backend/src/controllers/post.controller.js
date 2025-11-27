
import pool from "../config/database.js";
import slugify from "slugify";

// Helper: create tag if not exists → return tagId
const getOrCreateTag = async (conn, tagName) => {
    // Check if already exists
    const [existing] = await conn.query(
        "SELECT id FROM tags WHERE name = ?",
        [tagName]
    );

    if (existing.length > 0) return existing[0].id;

    // Create new tag
    const [result] = await conn.query(
        "INSERT INTO tags (name) VALUES (?)",
        [tagName]
    );

    return result.insertId;
};

export const createPost = async (req, res) => {
    const conn = await pool.getConnection();

    try {
        const userId = req.user.id;
        const { title, content, image_url, tags = [] } = req.body || {};

        if (!title || !content) {
            return res.status(400).json({ message: "Title & Content are required" });
        }

        // Start SQL transaction
        await conn.beginTransaction();

        // const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();
        const slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

        // 1️⃣ Create Post
        const [postResult] = await conn.query(
            `INSERT INTO posts (user_id, title, content, image_url, slug)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, title, content, image_url || null, slug]
        );

        const postId = postResult.insertId;

        // 2️⃣ Handle Tags
        if (tags.length > 0) {
            for (const tag of tags) {
                const tagId = await getOrCreateTag(conn, tag);

                await conn.query(
                    `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
                    [postId, tagId]
                );
            }
        }

        // Commit transaction
        await conn.commit();

        res.status(201).json({
            message: "Post created successfully",
            data: {
                id: postId,
                title,
                content,
                slug,
                image_url,
                tags
            }
        });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
};


export const getAllPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const [posts] = await pool.query(
            "SELECT id, title, content, image_url, slug, created_at, updated_at FROM posts WHERE user_id = ?",
            [userId]
        );

        res.status(200).json({
            message: "Posts retrieved successfully",
            data: posts
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
 };
export const getPostById = async (req, res) => { };
export const updatePost = async (req, res) => { };
export const deletePost = async (req, res) => { };
