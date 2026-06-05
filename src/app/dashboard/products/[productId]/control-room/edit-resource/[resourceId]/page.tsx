"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { inputStyle } from "@/lib/form-styles";
import {
  ChevronRight,
  Plus,
  Trash2,
  FolderBookmark,
  Cloud,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorAlert from "../../add-bulk-resource/components/ErrorAlert";
import { z } from "zod";

const editResourceSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  categoryId: z.string().min(1, "Category is required"),
  typeId: z.string().min(1, "Resource type is required"),
  toolId: z.string().min(1, "Tool is required"),
  toolPurpose: z
    .string()
    .min(1, "Tool purpose is required")
    .max(250, "Tool purpose must be under 250 characters"),
  instruction: z
    .string()
    .max(250, "Instruction must be under 250 characters")
    .optional(),
});

type EditResourceFormValues = z.infer<typeof editResourceSchema>;

const normalizeId = (value: unknown) =>
  typeof value === "string" ? value : ((value as any)?._id ?? "");

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const resourceId = params.resourceId as string;

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditResourceFormValues>({
    resolver: zodResolver(editResourceSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      typeId: "",
      toolId: "",
      toolPurpose: "",
      instruction: "",
    },
  });

  const watchedCategoryId = watch("categoryId");

  const { data: categories = [] } = useQuery({
    queryKey: ["resource-categories"],
    queryFn: async () => {
      const response = await axiosInstance.get("/resource-category/dropdown");
      return response.data;
    },
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["technology-tools"],
    queryFn: async () => {
      const response = await axiosInstance.get("/technology-tool/dropdown");
      return response.data;
    },
  });

  const { data: googleDriveItems = [] } = useQuery({
    queryKey: ["google-drive-items"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/tool-integration/items?companyId=6715f268a0578cbafeaa8eaf&toolName=google-drive&status=connected&userId=67629620c0e428615e293f17",
      );
      return response.data;
    },
  });

  const { data: resourceDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["resource-details", resourceId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/resource/${resourceId}`);
      return response.data?.data ?? response.data;
    },
    enabled: !!resourceId,
  });

  const { data: resourceTypes = [] } = useQuery({
    queryKey: ["resource-types", watchedCategoryId],
    queryFn: async () => {
      if (!watchedCategoryId) return [];
      const response = await axiosInstance.get(
        `/resource-type/by-category?categoryId=${watchedCategoryId}`,
      );
      return response.data?.types ?? response.data;
    },
    enabled: !!watchedCategoryId,
  });

  useEffect(() => {
    if (!resourceDetails) return;

    reset({
      name: resourceDetails.name ?? "",
      categoryId: normalizeId(resourceDetails.categoryId),
      typeId: normalizeId(resourceDetails.typeId),
      toolId: normalizeId(resourceDetails.toolId),
      toolPurpose: resourceDetails.toolPurpose ?? "",
      instruction: resourceDetails.instruction ?? "",
    });

    const incomingLinks = resourceDetails.links
      ? Array.isArray(resourceDetails.links)
        ? resourceDetails.links
        : String(resourceDetails.links)
            .split(",")
            .map((link) => link.trim())
            .filter(Boolean)
      : [];

    setLinks(incomingLinks.length ? incomingLinks : [""]);
  }, [resourceDetails, reset]);

  const updateLink = (index: number, value: string) => {
    setLinks((current) =>
      current.map((link, idx) => (idx === index ? value : link)),
    );
  };

  const addLinkField = () => {
    setLinks((current) => [...current, ""]);
  };

  const removeLinkField = (index: number) => {
    setLinks((current) => current.filter((_, idx) => idx !== index));
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalError(null);
    const files = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = files.filter((file) => file.size <= 10485760);
    const invalidFiles = files.filter((file) => file.size > 10485760);

    if (invalidFiles.length > 0) {
      setGlobalError(
        `File "${invalidFiles[0].name}" exceeds the maximum 10MB threshold limit.`,
      );
    }

    setSelectedFiles((current) => [...current, ...validFiles]);
  };

  const updateResourceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.patch(
        `/resource/edit/${resourceId}`,
        formData,
      );
      return response.data;
    },
  });

  const onSubmit = (data: EditResourceFormValues) => {
    setGlobalError(null);

    if (!productId) {
      setGlobalError("Unable to resolve product context.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("toolPurpose", data.toolPurpose);
    formData.append("instruction", data.instruction ?? "");
    formData.append("categoryId", data.categoryId);
    formData.append("typeId", data.typeId);
    formData.append("toolId", data.toolId);
    formData.append("productId", productId);

    const cleanedLinks = links.map((link) => link.trim()).filter(Boolean);
    if (cleanedLinks.length > 0) {
      formData.append("Links", cleanedLinks.join(","));
    }

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    updateResourceMutation.mutate(formData, {
      onSuccess: () => {
        router.push(`/dashboard/products/${productId}/control-room`);
      },
      onError: (error: any) => {
        setGlobalError(
          error?.response?.data?.message || error?.message || "Update failed.",
        );
      },
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((current) => current.filter((_, idx) => idx !== index));
  };

  if (!productId || !resourceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Resource path not found.
      </div>
    );
  }

  if (isDetailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading resource details...
      </div>
    );
  }

  const driveConnected = Array.isArray(googleDriveItems)
    ? googleDriveItems.length > 0
    : Boolean((googleDriveItems as any)?.data?.length);

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Products</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span>Control Room</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-blue-600 font-medium">Edit Resource</span>
          </div>
          
      </div>
            <div className="h-9 mb-6 flex items-center">
        <h1 className="text-3xl font-bold text-gray-800">Edit Resource</h1>
      </div>
      <div className=" bg-gray-50/30 font-sans antialiased text-gray-900 py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className=" bg-white p-6 ">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            </div>

            {globalError && <ErrorAlert message={globalError} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <section className="rounded-xl border border-gray-200 bg-slate-50/60 p-6">
                <div className="mb-6">
                  <p className="text-xl font-semibold text-gray-900">
                    Resource Info
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Resource Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      {...register("name")}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition ${
                        errors.name
                          ? "border-red-500 ring-1 ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }`}
                      placeholder="Earl Brown Education Consulting"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="categoryId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="categoryId"
                      {...register("categoryId")}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white outline-none transition ${
                        errors.categoryId
                          ? "border-red-500 ring-1 ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map((item: any) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-xs text-red-500">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="typeId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Resource Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="typeId"
                      {...register("typeId")}
                      disabled={!watchedCategoryId}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white outline-none transition ${
                        errors.typeId
                          ? "border-red-500 ring-1 ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }`}
                    >
                      <option value="">
                        {watchedCategoryId
                          ? "Select resource type"
                          : "Select category first"}
                      </option>
                      {resourceTypes.map((item: any) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {errors.typeId && (
                      <p className="text-xs text-red-500">
                        {errors.typeId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label
                      htmlFor="instruction"
                      className="text-sm font-medium text-gray-700"
                    >
                      Instruction
                    </label>
                    <textarea
                      id="instruction"
                      {...register("instruction")}
                      rows={5}
                      className={`w-full rounded-3xl border px-4 py-3 text-sm text-gray-900 bg-white outline-none transition ${
                        errors.instruction
                          ? "border-red-500 ring-1 ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }`}
                      placeholder="Keep instruction under 250 characters."
                    />
                    {errors.instruction ? (
                      <p className="text-xs text-red-500">
                        {errors.instruction.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Keep instruction under 250 characters.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-200 bg-slate-50/60 p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900">
                    Tool Info
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Select the tool and explain its purpose.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="toolId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tool <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="toolId"
                      {...register("toolId")}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white outline-none transition ${
                        errors.toolId
                          ? "border-red-500 ring-1 ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }`}
                    >
                      <option value="">Select tool</option>
                      {tools.map((item: any) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {errors.toolId && (
                      <p className="text-xs text-red-500">
                        {errors.toolId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="toolPurpose"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tool Purpose <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="toolPurpose"
                      {...register("toolPurpose")}
                      rows={5}
                      className={`w-full rounded-3xl border px-4 py-3 text-sm text-gray-900 bg-white outline-none transition ${
                        errors.toolPurpose
                          ? "border-red-500 ring-1 ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      }`}
                      placeholder="Keep tool purpose under 250 characters."
                    />
                    {errors.toolPurpose ? (
                      <p className="text-xs text-red-500">
                        {errors.toolPurpose.message}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Keep tool purpose under 250 characters.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-200 bg-slate-50/60 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Upload Files
                    </p>
                  </div>
                </div>

                <div className="border border-dashed border-[#D0D5DD] rounded-3xl bg-[#F9FAFB] text-center">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-transparent bg-white px-5 py-8 text-sm text-[#475467] hover:border-[#1570EF] transition cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-3 text-gray-500 mb-2">
                      <div className="p-2 rounded-full bg-blue-500 text-white">
                        <FolderBookmark className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-[#1D2939]">
                          Click or drag files to this area to upload
                        </span>
                        <span className="text-xs text-[#667085]">
                          You can upload any documents single or in bulk, up to
                          10MB.
                        </span>
                      </div>
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleFilesChange}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-white p-4 text-left text-sm text-[#344054]">
                    <div className="font-medium text-[#0F172A] mb-2">
                      Selected Files
                    </div>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#F8FAFC] px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-gray-200 bg-slate-50/60 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-gray-700">Add Links</h2>
                </div>

                <div className="space-y-4">
                  {links.map((link, index) => (
                    <div
                      key={`link-${index}`}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        className={inputStyle}
                      />
                      {links.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeLinkField(index)}
                          className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#FEE4E2] bg-white text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={addLinkField}
                        className="inline-flex h-6 items-center justify-center gap-2 rounded-full border border-[#1570EF] bg-white p-1 text-sm font-medium text-[#1570EF] hover:bg-blue-50 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/products/${productId}/control-room`)
                  }
                  className="inline-flex justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateResourceMutation.isPending}
                  className="inline-flex justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {updateResourceMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
