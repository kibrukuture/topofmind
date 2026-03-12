import axios from "axios";
import ApiError, { ApiErrorResponse } from "@/configs/api";

/**
 * Same-origin axios client for Top of Mind Next.js API routes.
 * No auth, no tenant - used for /api/* routes.
 */
export const topofmindClient = axios.create({
  baseURL: "",
  withCredentials: true,
});

topofmindClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data as ApiErrorResponse | undefined;
    if (apiError?.error) {
      return Promise.reject(new ApiError(apiError));
    }
    return Promise.reject(error);
  }
);
