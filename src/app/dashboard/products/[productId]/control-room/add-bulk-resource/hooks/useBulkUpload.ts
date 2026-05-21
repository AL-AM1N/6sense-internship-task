import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useBulkUpload = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post(
        "/resource/bulk-upload",
        formData
      );
      return response.data;
    },
  });
};