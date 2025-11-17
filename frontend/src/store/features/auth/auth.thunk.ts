import { axiosInstance } from "@/core/api";
import { API_ROUTES } from "@/core/constants";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const signUp = createAsyncThunk(
    "auth/signUp",
    async (credentials: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.REGISTER, credentials);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

export const logIn = createAsyncThunk(
    "auth/logIn",
    async (credentials: any, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.LOGIN, credentials);
            localStorage.setItem("token", response.data.token);
            return response.data;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);