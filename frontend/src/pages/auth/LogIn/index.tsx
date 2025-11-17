// src/pages/auth/LoginPage.tsx

import React, { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stack,
    Link,
    Divider,
    IconButton,
    InputAdornment,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "@/store/hooks";
import { logIn } from "@/store/features/auth/auth.thunk";
import { toast } from "react-toastify";

interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
}

const initialValues: LoginFormValues = {
    email: "",
    password: "",
    rememberMe: false,
};

const validationSchema = Yup.object({
    email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
    password: Yup.string().required("Password is required"),
});

const LogIn: React.FC = () => {
    const dispath = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik<LoginFormValues>({
        initialValues,
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    email: values.email,
                    password: values.password,
                };
                const response = await dispath(logIn(payload)).unwrap();
                toast.success(response.message);
            } catch (error) {
                console.error(error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
    } = formik;

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                background:
                    "radial-gradient(circle at top left, #e3f2fd 0, transparent 50%), radial-gradient(circle at bottom right, #fce4ec 0, #ffffff 55%)",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: 4,
                    borderRadius: 4,
                    backdropFilter: "blur(10px)",
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Typography
                    variant="overline"
                    sx={{ letterSpacing: 2, color: "primary.main" }}
                >
                    TODONOTES
                </Typography>

                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Welcome back
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Log in to continue managing your{" "}
                    <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
                        todos
                    </Box>{" "}
                    and{" "}
                    <Box component="span" sx={{ color: "secondary.main", fontWeight: 600 }}>
                        notes
                    </Box>
                    .
                </Typography>

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            name="email"
                            fullWidth
                            size="small"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                        />

                        <TextField
                            label="Password"
                            name="password"
                            fullWidth
                            size="small"
                            type={showPassword ? "text" : "password"}
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            aria-label="toggle password visibility"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="rememberMe"
                                        checked={values.rememberMe}
                                        onChange={handleChange}
                                        size="small"
                                    />
                                }
                                label={
                                    <Typography variant="body2" color="text.secondary">
                                        Remember me
                                    </Typography>
                                }
                            />

                            <Link href="/forgot-password" variant="body2" underline="hover">
                                Forgot password?
                            </Link>
                        </Stack>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isSubmitting}
                            sx={{ mt: 1 }}
                        >
                            {isSubmitting ? "Logging in..." : "Log In"}
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mt: 1 }}
                >
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" underline="hover">
                        Sign up
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default LogIn;
