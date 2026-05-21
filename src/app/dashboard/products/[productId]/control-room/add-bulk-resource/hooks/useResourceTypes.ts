import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useResourceTypes = (
  categoryId: string
) => {

  return useQuery({

    queryKey: [
      "resourceTypesByCategory",
      categoryId,
    ],

    queryFn: async () => {

      if (!categoryId) return [];

      const response =
        await axiosInstance.get(
          `/resource-type/by-category?categoryId=${categoryId}`
        );

      return response.data?.types ??
             response.data;
    },

    enabled: !!categoryId,
  });
};