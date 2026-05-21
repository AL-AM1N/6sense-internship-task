import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useCategories = () => {

  return useQuery({

    queryKey: ["resourceCategoriesGlobal"],

    queryFn: async () => {

      const response =
        await axiosInstance.get(
          "/resource-category/dropdown"
        );

      return response.data;
    },
  });
};