export const getAllPosts = async (req, res) => {
    try {
        const [posts] = await pool.query(`
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) AS comments
            FROM posts p
            WHERE p.is_deleted = false
            ORDER BY p.created_at DESC
        `);

        // Attach tags to each post
        for (let post of posts) {
            const [tags] = await pool.query(`
                SELECT t.id, t.name
                FROM tags t
                JOIN post_tags pt ON t.id = pt.tag_id
                WHERE pt.post_id = ?
            `, [post.id]);

            post.tags = tags;
        }

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        const [post] = await pool.query(`
            SELECT * FROM posts WHERE id = ? AND is_deleted = false
        `, [id]);

        if (post.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const postData = post[0];

        // Get tags
        const [tags] = await pool.query(`
            SELECT t.id, t.name
            FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            WHERE pt.post_id = ?
        `, [id]);

        postData.tags = tags;

        res.status(200).json(postData);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, content, image_url, tags = [] } = req.body;

        // First check if post exists
        const [post] = await pool.query(
            "SELECT * FROM posts WHERE id = ? AND user_id = ? AND is_deleted = false",
            [id, userId]
        );

        if (post.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const slug = slugify(title, { lower: true });

        await pool.query(
            `UPDATE posts 
             SET title=?, content=?, image_url=?, slug=? 
             WHERE id=?`,
            [title, content, image_url, slug, id]
        );

        // Update tags: delete old + insert new
        await pool.query("DELETE FROM post_tags WHERE post_id = ?", [id]);

        for (let tagName of tags) {
            let [existingTag] = await pool.query(
                "SELECT id FROM tags WHERE name = ?",
                [tagName]
            );

            let tagId;

            if (existingTag.length > 0) {
                tagId = existingTag[0].id;
            } else {
                const [insertTag] = await pool.query(
                    "INSERT INTO tags (name) VALUES (?)",
                    [tagName]
                );
                tagId = insertTag.insertId;
            }

            await pool.query(
                "INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)",
                [id, tagId]
            );
        }

        res.status(200).json({ message: "Post updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deletePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [post] = await pool.query(
            "SELECT * FROM posts WHERE id = ? AND user_id = ? AND is_deleted = false",
            [id, userId]
        );

        if (post.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        await pool.query(
            "UPDATE posts SET is_deleted = true WHERE id = ?",
            [id]
        );

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


