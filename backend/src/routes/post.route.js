import express from "express";
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.post("/", createPost);
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPostById);
postRouter.put("/:id", updatePost);
postRouter.delete("/:id", deletePost);  

export default postRouter;