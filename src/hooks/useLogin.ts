import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

import axios from "axios";

const loginUser = async (
  data: {
    email: string;
    password: string;
  }
) => {

const response =
    await axiosInstance.post(

      "/auth/sign-in",

      {
        email: data.email,
        password: data.password,
        grantType: "password",
      }
    );

  return response.data;
};


export const useLogin = () => {

  return useMutation({
    mutationFn: loginUser,
  });
};