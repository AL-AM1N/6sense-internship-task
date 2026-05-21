"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { ChevronRight, X } from "lucide-react";
import { LuFileStack } from "react-icons/lu";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { HiSquare3Stack3D } from "react-icons/hi2";

// Imports from reusable files
import { BulkFormValues, bulkResourceFormSchema } from "./bulk-schema";
import { DropdownItem, ResourceTypeItem } from "./bulk-type";
import ErrorAlert from "./components/ErrorAlert";
import ResourceCard from "./components/ResourceCard";
import { useCategories } from "./hooks/useCategories";
import { useTools } from "./hooks/useTools";
import { useResourceTypes } from "./hooks/useResourceTypes";
import { useBulkUpload } from "./hooks/useBulkUpload";
import { buildBulkFormData } from "./utils/buildBulkFormData";

export default function AddBulkResourcePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<{
    index: number;
    type: "tool" | "category";
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hooks for data fetching
  const { data: categories = [] } = useCategories();
  const { data: tools = [] } = useTools();
  const bulkUploadMutation = useBulkUpload();

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BulkFormValues>({
    resolver: zodResolver(bulkResourceFormSchema),
    defaultValues: { resources: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resources",
  });

  const watchedResources = watch("resources");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // File upload handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setGlobalError(null);
      acceptedFiles.forEach((file) => {
        if (file.size > 10485760) {
          setGlobalError(
            `File "${file.name}" exceeds the maximum 10MB threshold limit.`
          );
          return;
        }

        append({
          fileName: file.name,
          fileSize: Number((file.size / (1024 * 1024)).toFixed(3)),
          fileObject: file,
          resourceName: "",
          category: "",
          resourceType: "",
          tool: "",
          toolPurpose: "",
          instruction: "",
        });
      });
    },
    [append]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  // Resource type selector component
  const ResourceTypeSelector = ({
    index,
    categoryId,
  }: {
    index: number;
    categoryId: string;
  }) => {
    const { data: typeData, isLoading } = useResourceTypes(categoryId);

    return (
      <Controller
        control={control}
        name={`resources.${index}.resourceType`}
        render={({ field }) => (
          <select
            {...field}
            disabled={!categoryId || isLoading}
            className={`w-44 px-3 py-2 border rounded-lg text-sm bg-white text-gray-700 outline-none transition-all cursor-pointer ${
              errors.resources?.[index]?.resourceType
                ? "border-red-500 ring-1 ring-red-200"
                : "border-gray-200 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            }`}
          >
            <option value="" disabled hidden>
              Resource Type
            </option>
            {typeData?.map((type: ResourceTypeItem) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        )}
      />
    );
  };

  // Submit handler
  const onSubmitForm = (data: BulkFormValues) => {
    setGlobalError(null);

    if (!data.resources || data.resources.length === 0) {
      setGlobalError("Please add at least one resource");
      return;
    }

    const formData = buildBulkFormData(data, productId);
    const entries = Array.from(formData.entries());

    if (entries.length === 0) {
      setGlobalError(
        "No valid resources to upload. Please fill all required fields."
      );
      return;
    }

    bulkUploadMutation.mutate(formData, {
      onSuccess: () => {
        reset();
        router.push(`/dashboard/products/${productId}/control-room`);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Upload failed";
        setGlobalError(errorMessage);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans antialiased text-gray-900">
      <div className="mx-auto max-w-7xl bg-white p-6" ref={dropdownRef}>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span>Products</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span
            className="text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={() =>
              router.push(`/dashboard/products/${productId}/control-room`)
            }
          >
            Control Room
          </span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-blue-600 font-medium">Add Resources</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Resources</h1>

        {globalError && <ErrorAlert message={globalError} />}

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
              fields.length === 0 ? "h-95" : "py-4 bg-gray-50/50"
            } ${
              isDragActive
                ? "border-blue-500 bg-blue-50/40"
                : "border-gray-200 bg-white hover:bg-gray-50/50"
            }`}
          >
            <input {...getInputProps()} />
            <HiSquare3Stack3D className="w-10 h-10 text-blue-500 mb-3" />
            <p className="text-sm font-semibold text-gray-700">
              Click or drag file to this area to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Support for a single or bulk upload within 10MB.
            </p>
          </div>

          {/* Resources List */}
          {fields.length > 0 && (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <ResourceCard
                  key={field.id}
                  index={index}
                  control={control}
                  errors={errors}
                  watchedResources={watchedResources}
                  tools={tools}
                  categories={categories}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  remove={remove}
                  setValue={setValue}
                  ResourceTypeSelector={ResourceTypeSelector}
                />
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={bulkUploadMutation.isPending}
              onClick={() =>
                router.push(`/dashboard/products/${productId}/control-room`)
              }
              className="px-5 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={fields.length === 0 || bulkUploadMutation.isPending}
              className="px-5 py-2 bg-blue-600 text-sm font-medium rounded-lg text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {bulkUploadMutation.isPending ? "Uploading..." : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
