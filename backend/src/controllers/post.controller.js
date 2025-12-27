
import pool from "../config/database.js";
import slugify from "slugify";
import { buildUpdateQuery } from "../utils/buildUpdateQuery.js";

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

        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.title,
                p.content,
                p.slug,
                p.image_url,
                p.created_at,
                p.updated_at,

                -- Tags as comma-separated list
                GROUP_CONCAT(DISTINCT t.name) AS tags,

                -- Count likes on each post
                COUNT(DISTINCT pl.id) AS likesCount,

                -- Count comments (not deleted)
                COUNT(DISTINCT c.id) AS commentCount

            FROM posts p
            LEFT JOIN post_tags pt ON p.id = pt.post_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            LEFT JOIN post_likes pl ON p.id = pl.post_id
            LEFT JOIN comments c ON p.id = c.post_id AND c.is_deleted = false

            WHERE p.user_id = ? AND p.is_deleted = false
            GROUP BY p.id
            ORDER BY p.created_at DESC;
        `, [userId]);

        // Format tags into array
        const formattedData = rows.map(post => ({
            ...post,
            tags: post.tags ? post.tags.split(",") : []
        }));
        // console.log(rows, 'enumsam');

        res.status(200).json({
            message: "Posts retrieved successfully",
            data: formattedData
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        // Get Post 
        const [postRow] = await pool.query(`
            SELECT 
                id,
                title,
                content,
                slug,
                image_url,
                created_at,
                updated_at
            from posts
            WHERE id = ? AND is_deleted = false
        `, [id]);

        if (postRow.length === 0) {
            return res.status(404).json({ message: "Post not found", data: null });
        }

        const post = postRow[0];

        // Get tags
        const [tags] = await pool.query(`
            SELECT t.id, t.name
            FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            WHERE pt.post_id = ?
        `, [id]);

        // Like Count
        const [[likeResult]] = await pool.query(
            `
            SELECT COUNT(*) AS likesCount
            FROM post_likes
            WHERE post_id = ?
            `,
            [id]
        );

        // Comment Count
        const [[commentResult]] = await pool.query(
            `
            SELECT COUNT(*) AS commentCount
            FROM comments
            WHERE post_id = ? AND is_deleted = false
            `,
            [id]
        );

        // Attach extra info
        post.tags = tags;
        post.likesCount = likeResult.likesCount;
        post.commentCount = commentResult.commentCount;

        res.status(200).json({
            message: "Post retrieved successfully",
            data: post
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updatePost = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { tags, title, ...rest } = req.body || {};

        // Validate data
        if (Object.keys(req.body || {}).length === 0) {
            return res.status(400).json({ message: "No fields provided to update" });
        }

        // Check post exists & belongs to user
        const [existingPost] = await conn.query(
            "SELECT * FROM posts WHERE id = ? AND user_id = ? AND is_deleted = false",
            [id, userId]
        );

        if (existingPost.length === 0) {
            return res.status(404).json({ message: "Post not found or does not belong to user" });
        }

        await conn.beginTransaction();

        const updateData = {
            ...rest
        };

        // If title updated → regenerate slug
        if (title) {
            updateData.title = title;
            updateData.slug = slugify(title, { lower: true, strict: true });
        }

        const { sql, values } = buildUpdateQuery(
            "posts",
            updateData,
            { id: id }
        );

        if (!sql) {
            return res.status(400).json({ message: "No fields provided to update" });
        }

        await conn.query(sql, values);

        // Update Tags
        if (Array.isArray(tags)) {
            // Remove old tags
            await conn.query(
                "DELETE FROM post_tags WHERE post_id = ?",
                [id]
            );

            // Add new tags
            for (const tag of tags) {
                const tagId = await getOrCreateTag(conn, tag);
                await conn.query(
                    "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)",
                    [id, tagId]
                );
            }
        }

        await conn.commit();

        // Fetch updated post
        const [updatedPostRows] = await conn.query(`
                SELECT 
                    p.id,
                    p.title,
                    p.content,
                    p.slug,
                    p.image_url,
                    p.created_at,
                    p.updated_at,
                    GROUP_CONCAT(DISTINCT t.name) AS tags
                FROM posts p
                LEFT JOIN post_tags pt ON p.id = pt.post_id
                LEFT JOIN tags t ON pt.tag_id = t.id
                WHERE p.id = ?
                GROUP BY p.id
            `, [id]);

        const updatedPost = updatedPostRows[0];

        updatedPost.tags = updatedPost.tags
            ? updatedPost.tags.split(",")
            : [];

        res.status(200).json({
            message: "Post updated successfully",
            data: updatedPost
        });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
};

export const deletePost = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check post exists & belongs to user
        const [existingPost] = await conn.query(
            "SELECT * FROM posts WHERE id = ? AND user_id = ? AND is_deleted = false",
            [id, userId]
        );

        if (existingPost.length === 0) {
            return res.status(404).json({
                message: "Post not found or you are not authorized"
            });
        }

        await conn.beginTransaction();

        await conn.query(
            "UPDATE posts SET is_deleted = true WHERE id = ?",
            [id]
        );

        await conn.query(
            "UPDATE comments SET is_deleted = true WHERE post_id = ?",
            [id]
        );

        await conn.commit();

        res.status(200).json({
            message: "Post deleted successfully",
            data: {
                id
            }
        });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }
};

export const toggleLikePost = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await conn.beginTransaction();

        const [post] = await conn.query(
            "SELECT * FROM posts WHERE id = ? AND is_deleted = false",
            [id]
        );

        if (post.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Post not found" });
        }

        const [existingLike] = await conn.query(
            "SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?",
            [userId, id]
        );

        let action ="";

        if (existingLike.length === 0) {
            await conn.query(
                "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)",
                [userId, id]
            );
            action = "liked";
        } else {
            await conn.query(
                "DELETE FROM post_likes WHERE user_id = ? AND post_id = ?",
                [userId, id]
            );
            action = "unliked";
        }

        const [[likeCount]] = await conn.query(
            "SELECT COUNT(*) AS likesCount FROM post_likes WHERE post_id = ?",
            [id]
        );
        // console.log(likeCount, 'enumsam');

        await conn.commit();

        res.status(200).json({
            message: `Post ${action} successfully`,
            data: {
                id,
                action,
                likesCount: likeCount.likesCount
            }
        });
        
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        conn.release();
    }       
}
