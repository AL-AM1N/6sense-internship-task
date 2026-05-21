import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useTools = () => {

  return useQuery({

    queryKey: ["technologyToolsGlobal"],

    queryFn: async () => {

      const response =
        await axiosInstance.get(
          "/technology-tool/dropdown"
        );

      return response.data;
    },
  });
};