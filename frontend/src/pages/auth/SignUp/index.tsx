// src/pages/auth/SignupPage.tsx

import React from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stack,
    Link,
    Divider,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/store/hooks";
import { signUp } from "@/store/features/auth/auth.thunk";
import { toast } from "react-toastify";

interface SignupFormValues {
    fullName: string;
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const initialValues: SignupFormValues = {
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

const validationSchema = Yup.object({
    fullName: Yup.string().trim().required("Full name is required"),
    userName: Yup.string().trim().required("Username is required"),
    email: Yup.string()
        .email("Enter a valid email")
        .required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .required("Please confirm your password"),
});

const SignUp: React.FC = () => {
    const dispath = useAppDispatch();

    const formik = useFormik<SignupFormValues>({
        initialValues,
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    name: values.fullName,
                    username: values.userName,
                    email: values.email,
                    password: values.password
                }
                const response = await dispath(signUp(payload)).unwrap();
                toast.success(response.message);
            } catch (error) {
                console.error(error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
        formik;

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
                    maxWidth: 440,
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
                    Create your account
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Sign up to start organizing your{" "}
                    <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
                        todos
                    </Box>{" "}
                    and{" "}
                    <Box component="span" sx={{ color: "secondary.main", fontWeight: 600 }}>
                        notes
                    </Box>{" "}
                    in one place.
                </Typography>

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Full Name"
                            name="fullName"
                            fullWidth
                            size="small"
                            value={values.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.fullName && Boolean(errors.fullName)}
                            helperText={touched.fullName && errors.fullName}
                        />

                        <TextField
                            label="Username"
                            name="userName"
                            fullWidth
                            size="small"
                            value={values.userName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.userName && Boolean(errors.userName)}
                            helperText={touched.userName && errors.userName}
                        />

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
                            type="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                        />

                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            fullWidth
                            size="small"
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={isSubmitting}
                            sx={{ mt: 1 }}
                        >
                            {isSubmitting ? "Creating account..." : "Sign Up"}
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
                    Already have an account?{" "}
                    <Link href="/login" underline="hover">
                        Log in
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default SignUp;
