import { axiosInstance } from "@/core/api";
import { API_ROUTES } from "@/core/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const createTodo = createAsyncThunk(
    "todos/createTodo",
    async (todo, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.TODOS, todo);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);
