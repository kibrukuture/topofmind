 
import { topofmindClient } from "@/services/topofmind-client";
import ApiError, { ApiSuccessResponse, ApiErrorResponse } from "@/configs/api";
import type { AxiosResponse } from "axios";

/**
 * Type-safe GET request that unwraps ApiSuccessResponse
 */
export async function get<T>(url: string, params?: unknown): Promise<T> {
  try {
    const response = await topofmindClient.get<ApiSuccessResponse<T> | ApiErrorResponse>(url, { params });

    // Check if response contains an error
    if ('error' in response.data) {
      throw new ApiError(response.data);
    }
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Type-safe POST request that unwraps ApiSuccessResponse
 */
export async function post<T>(url: string, payload?: unknown): Promise<T> {
  try {
    const response = await topofmindClient.post<ApiSuccessResponse<T> | ApiErrorResponse>(url, payload);

    // Check if response contains an error
    if ('error' in response.data) {
      throw new ApiError(response.data);
    }
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Type-safe PUT request that unwraps ApiSuccessResponse
 */
export async function put<T>(url: string, payload?: unknown): Promise<T> {
  try {
    const response = await topofmindClient.put<ApiSuccessResponse<T> | ApiErrorResponse>(url, payload);

    // Check if response contains an error
    if ('error' in response.data) {
      throw new ApiError(response.data);
    }
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Type-safe PATCH request that unwraps ApiSuccessResponse
 */
export async function patch<T>(url: string, payload?: unknown): Promise<T> {
  try {
    const response = await topofmindClient.patch<ApiSuccessResponse<T> | ApiErrorResponse>(url, payload);

    // Check if response contains an error
    if ('error' in response.data) {
      throw new ApiError(response.data);
    }
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Type-safe DELETE request that unwraps ApiSuccessResponse
 */
export async function del<T>(
  url: string,
  options?: {
    query?: Record<string, string>;
    body?: unknown;
  }
): Promise<T> {
  try {
    const response = await topofmindClient.delete<ApiSuccessResponse<T> | ApiErrorResponse>(url, {
      params: options?.query,
      data: options?.body,
    });

    // Check if response contains an error

    if ('error' in response.data) {
      throw new ApiError(response.data);
    }
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * GET request for binary data (blobs) - returns raw response without JSON unwrapping
 */
export async function getBlob(url: string, params?: unknown): Promise<AxiosResponse<Blob>> {
  try {
    const response = await topofmindClient.get<Blob>(url, {
      params,
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * POST FormData for Top of Mind API routes (same-origin).
 * Unwraps { data: T } on success; throws ApiError on error.
 */
export async function postFormData<T>(
  url: string,
  formData: FormData
): Promise<T> {
  const response = await topofmindClient.post<
    ApiSuccessResponse<T> | ApiErrorResponse
  >(url, formData);

  if ("error" in response.data) {
    throw new ApiError(response.data);
  }
  return response.data.data;
}



export async function postStream<T>(
  url: string,
  formData: FormData,
  onEvent: (event: T) => void
): Promise<T extends { type: "done"; data: infer D } ? D : never> {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok || !response.body) {
    throw new Error("stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalData: any = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event = JSON.parse(trimmed) as T;
        onEvent(event);
        if ((event as any).type === "done") {
          finalData = (event as any).data;
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  if (!finalData) throw new Error("no final data received");
  return finalData;
}