import axios, { AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

export interface APIRequestProps {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" | "OPTIONS";
  path: string;
  data?: any;
  onSuccess?: (res: any) => void;
  onError?: (error: any) => void;
  finaly?: () => void;
  loading?: string;
  success?: string;
  error?: string;
}

export async function apiRequest({
  method,
  path,
  data,
  onSuccess,
  onError,
  finaly,
  loading,
  success,
  error,
}: APIRequestProps) {
  try {
    const config: AxiosRequestConfig<any> = {
      url:
        ((import.meta as any).env.VITE_APP_API ||
          "https://knowledgebase-api.217-160-150-142.plesk.page") + path,
      method: method ?? "GET",
      data,
      headers: {
        Accept: "application/json",
      },
      withCredentials: true,
    };
    const request = axios.request(config);

    toast
      .promise(request, {
        loading: loading ?? "Processing your request...",
        success: success ?? "success",
        error: error ?? "Something went wrong!",
      })
      .then((res) => {
        onSuccess?.(res);
      })
      .catch((err) => {
        console.log(err);
        onError?.(
          err?.response?.data?.error ??
          err?.response?.data ??
          err?.message ??
          error ??
          "Something went wrong. try again later!"
        );
      })
      .finally(finaly);
  } catch (error) {
    toast.error("Something went wrong!");

    console.log(error);
  }
}

export const llmList = [
  {
    label: "Gemma:2B",
    value: "gemma:2b",
  },
  {
    label: "Llama2",
    value: "llama2",
  },
];
