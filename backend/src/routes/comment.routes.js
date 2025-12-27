import express from "express";
import { createComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";

const commentRoutes = express.Router();

commentRoutes.post("/:postId/comment", createComment);
commentRoutes.get("/:postId/comments", getAllComments);
commentRoutes.put("/comments/:commentId", updateComment);
commentRoutes.delete("/comments/:commentId", deleteComment);

export default commentRoutes;