"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { setUser } from "../redux/authSlice";
import Button from "@/components/Button/Button";
import { useLogin } from "@/hooks/useLogin";
import Cookies from "js-cookie";


const Login = () => {

    const router = useRouter();
    const dispatch = useDispatch();
    const { mutate, isPending } = useLogin();

    // All States

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [serverError, setServerError] = useState("");

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Handle Submit

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setEmailError("");
        setPasswordError("");
        setServerError("");

        // validation

        if (!email) {
            setEmailError("Email is required");
        }

        if (!password) {
            setPasswordError("Password is required");
        }

        if (!email || !password) return;

        if (
            !email.includes("@") ||
            !email.includes(".")
        ) {
            setEmailError(
                "Please enter a valid email address"
            );
            return;
        }

        // API CALL
        mutate(
            {
                email,
                password,
            },

            {
                onSuccess: (data) => {

                    console.log(data);

                    // save token in cookies

                    Cookies.set(
                        "accessToken",
                        data.auth.accessToken
                    );

                    Cookies.set(
                        "refreshToken",
                        data.auth.refreshToken
                    );

                    // redux persist

                    dispatch(
                        setUser({
                            accessToken:
                                data.auth.accessToken,

                            refreshToken:
                                data.auth.refreshToken,

                            user: data.user,
                        })
                    );

                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Login Successful",
                        showConfirmButton: false,
                        timer: 1500,
                    });

                    router.push("/dashboard");
                },

                onError: (err: any) => {

                    console.log(err);

                    setServerError(
                        err?.response?.data?.message
                    );

                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Login failed",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                },
            }
        );
    };

    return (

        <div className="flex flex-col justify-center items-center min-h-screen">

            {/* Logo */}

            <div className="flex justify-center py-4">
                <img
                    className="w-30"
                    src="/image.png"
                    alt="logo"
                />
            </div>

            {/* Form */}

            <div className="flex justify-center">

                <form
                    onSubmit={handleSubmit}
                    className="fieldset bg-base-200 w-xs border-t-5 border-blue-600 p-4 space-y-2.5"
                >


                    <div className="pb-2">

                        <h2 className="text-2xl font-bold">
                            Login
                        </h2>

                        <p className="text-gray-400">
                            Continue with pattern50
                        </p>

                    </div>

                    {/* Email */}

                    <div>
                        <label className="label">
                            Email Address
                        </label>

                        <input
                            type="email"
                            className="input"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                        {emailError && (
                            <p className="text-red-500 text-sm">
                                {emailError}
                            </p>
                        )}
                    </div>

                    {/* Password */}

                    <div>
                        <label className="label">
                            Password
                        </label>

                        <div className="relative">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                className="input"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                            {showPassword ? (

                                <FaEye
                                    onClick={() =>
                                        setShowPassword(false)
                                    }
                                    className="absolute size-5 text-gray-500 right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                />

                            ) : (

                                <FaEyeSlash
                                    onClick={() =>
                                        setShowPassword(true)
                                    }
                                    className="absolute size-5 text-gray-500 right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                />

                            )}

                        </div>

                        {passwordError && (
                            <p className="text-red-500 text-sm">
                                {passwordError}
                            </p>
                        )}

                        {/* Server Error */}

                        {serverError && (
                            <p className="text-red-500 text-sm">
                                {serverError}
                            </p>
                        )}
                    </div>

                    {/* Forgot Password */}

                    <p className="text-gray-500 text-right cursor-pointer">
                        Forget password?
                    </p>

                    {/* Submit Button */}

                    {/* <button
                        type="submit"
                        disabled={loading}
                        className="btn text-white mt-4 bg-blue-600"
                    >

                        {
                            loading
                                ? "Logging in..."
                                : "Login"
                        }

                    </button> */}

                    <Button type="submit" variant="primary" size="md" className="cursor-pointer">
                        {isPending ? "Logging in..." : "Login"}
                    </Button>

                </form>
            </div>

        </div>
    );
};

export default Login;