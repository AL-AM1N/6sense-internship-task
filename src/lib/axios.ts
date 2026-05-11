import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

// Request Interceptor

axiosInstance.interceptors.request.use(
  (config) => {
    
    // LOGIN API
    // use Basic token

    if (config.url?.includes("/auth/sign-in")) {
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

      const secretId = process.env.NEXT_PUBLIC_CLIENT_SECRET;

      const base64Credentials = btoa(`${clientId}:${secretId}`);

      config.headers.Authorization = `Basic ${base64Credentials}`;
    }

    // OTHER APIs
    // use Bearer token
    else {
      const token = Cookies.get("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);




// REFRESH TOKEN FUNCTION

const refreshToken = async () => {

  try {

    const response = await axios.post(

      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/sign-in`,

      {
        refreshToken:
          Cookies.get("refreshToken"),

        grantType: "refreshToken",
      }
    );

    // NEW TOKENS

    const newAccessToken =
      response.data.auth.accessToken;

    const newRefreshToken =
      response.data.auth.refreshToken;

    // SAVE NEW TOKENS IN COOKIES

    Cookies.set(
      "accessToken",
      newAccessToken
    );

    Cookies.set(
      "refreshToken",
      newRefreshToken
    );

    // RETURN NEW ACCESS TOKEN

    return newAccessToken;

  } catch (error) {

    console.log(
      "Refresh token failed"
    );

    // REMOVE TOKENS

    Cookies.remove("accessToken");

    Cookies.remove("refreshToken");

    return null;
  }
};



// RESPONSE INTERCEPTOR

axiosInstance.interceptors.response.use(

  // SUCCESS RESPONSE

  (response) => {
    return response;
  },

  // ERROR RESPONSE

  async (error) => {

    const originalRequest =
      error.config;

    // TOKEN EXPIRED

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      // CREATE NEW ACCESS TOKEN

      const newAccessToken =
        await refreshToken();

      // IF NEW TOKEN EXISTS

      if (newAccessToken) {

        // UPDATE HEADER

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // RETRY OLD REQUEST

        return axiosInstance(
          originalRequest
        );
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
