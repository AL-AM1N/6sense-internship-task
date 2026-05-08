"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

const Login = () => {

    const router = useRouter();

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
        try {

            setLoading(true);

            const clientId =
                process.env.NEXT_PUBLIC_CLIENT_ID;

            const secretId =
                process.env.NEXT_PUBLIC_CLIENT_SECRET;

            const base64Credentials = btoa(
                `${clientId}:${secretId}`
            );

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/auth/sign-in`,
                {
                    email,
                    password,
                    grantType: "password"
                },
                {
                    headers: {
                        Authorization: `Basic ${base64Credentials}`,
                    },
                }
            );

            console.log(response.data);
            
            // save token to local storage
            localStorage.setItem(
                "token",
                response.data.accessToken
            );



            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500
            });

            // alert("Login Successful");
            router.push("/home");

        } catch (err: any) {

            console.log(err);

            setServerError(
                err?.response?.data?.message ||
                "Login failed"
            );

            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Login failed",
                text: "Invalid email or password",
                showConfirmButton: false,
                timer: 1500,
            });

        } finally {

            setLoading(false);

        }
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn text-white mt-4 bg-blue-600"
                    >

                        {
                            loading
                                ? "Logging in..."
                                : "Login"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
};

export default Login;