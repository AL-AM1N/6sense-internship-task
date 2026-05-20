"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { ChevronRight, X, Layers, ChevronDown } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { LuFileStack } from "react-icons/lu";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { HiSquare3Stack3D } from "react-icons/hi2";
import { DropdownItem, ResourceTypeItem } from "./bulk-type";


// ================= ZOD SCHEMA =================
const singleResourceSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  fileObject: z.any(),
  resourceName: z.string().min(1, "Resource name is required"),
  category: z.string().min(1, "Category is required"),
  resourceType: z.string().min(1, "Resource type is required"),
  tool: z.string().min(1, "Tool parameter is required"),
  toolPurpose: z.string().min(1, "tool purpose is required").max(250, "Keep under 250 characters"),
  instruction: z.string().max(250, "Keep under 250 characters").optional().or(z.literal("")),
});

const bulkResourceFormSchema = z.object({
  resources: z.array(singleResourceSchema).min(1, "Please upload at least one valid resource"),
});

type BulkFormValues = z.infer<typeof bulkResourceFormSchema>;

export default function AddBulkResourcePage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [globalError, setGlobalError] = useState<string | null>(null);

  // Active custom dropdown visibility toggles
  const [activeDropdown, setActiveDropdown] = useState<{ index: number; type: "tool" | "category" } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= REACT QUERY DATA FETCHING =================
  const { data: categories = [] } = useQuery<DropdownItem[]>({
    queryKey: ["resourceCategoriesGlobal"],
    queryFn: async () => {
      const response = await axiosInstance.get("https://beta-api.pattern50.com/resource-category/dropdown");
      return response.data;
    },
  });

  const { data: tools = [] } = useQuery<DropdownItem[]>({
    queryKey: ["technologyToolsGlobal"],
    queryFn: async () => {
      const response = await axiosInstance.get("https://beta-api.pattern50.com/technology-tool/dropdown");
      return response.data;
    },
  });

  // ================= REACT HOOK FORM SETUP =================
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BulkFormValues>({
    resolver: zodResolver(bulkResourceFormSchema),
    defaultValues: {
      resources: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resources",
  });

  const watchedResources = watch("resources");

  // ================= FILE UPLOAD CONTROLLER (DROPZONE) =================
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setGlobalError(null);
      acceptedFiles.forEach((file) => {
        if (file.size > 10485760) {
          setGlobalError(`File "${file.name}" exceeds the maximum 10MB threshold limit.`);
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  // ================= MUTABLE RESOURCE TYPE FETCH COMPONENT =================
  const ResourceTypeSelector = ({ index, categoryId }: { index: number; categoryId: string }) => {
    const { data: typeData, isLoading } = useQuery<ResourceTypeItem[]>({
      queryKey: ["resourceTypesByCategory", categoryId],
      queryFn: async () => {
        if (!categoryId) return [];
        const response = await axiosInstance.get(
          `https://beta-api.pattern50.com/resource-type/by-category?categoryId=${categoryId}`
        );
        return response.data?.types ?? response.data;
      },
      enabled: !!categoryId,
    });

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
            {typeData?.map((type) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        )}
      />
    );
  };

  // ================= SUBMIT HANDLER =================
  const onSubmitForm = async (data: BulkFormValues) => {
    try {
      setGlobalError(null);
      
      // Organized plain objects layout mapping
      const structuredPayload = data.resources.map((item) => ({
        productId,
        name: item.resourceName,
        categoryId: item.category,
        resourceTypeId: item.resourceType,
        toolId: item.tool,
        purpose: item.toolPurpose,
        instruction: item.instruction || undefined,
        file: {
          name: item.fileName,
          size: item.fileSize,
          binary: item.fileObject
        }
      }));

      console.log("Organized Payload Object Stream:", structuredPayload);

      const multipartPayloads = data.resources.map((item) => {
        const formData = new FormData();
        formData.append("file", item.fileObject);
        formData.append("name", item.resourceName);
        formData.append("categoryId", item.category);
        formData.append("resourceTypeId", item.resourceType);
        formData.append("toolId", item.tool);
        formData.append("purpose", item.toolPurpose);
        formData.append("productId", productId);
        if (item.instruction) {
          formData.append("instruction", item.instruction);
        }
        return formData;
      });

      alert("Form submitted successfully! Check console for payload details.");

      // await Promise.all(
      //   multipartPayloads.map((payload) =>
      //     axiosInstance.post("/resource/create", payload, {
      //       headers: { "Content-Type": "multipart/form-data" },
      //     })
      //   )
      // );

      router.push(`/dashboard/products/${productId}/control-room`);
    } catch (err: any) {
      setGlobalError(err?.response?.data?.message || "An expected processing breakdown popped up inside multi-upload pipeline updates.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans antialiased text-gray-900">
      <div className="mx-auto max-w-7xl bg-white p-6" ref={dropdownRef}>
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Products</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 cursor-pointer" onClick={() => router.push(`/dashboard/products/${productId}/control-room`)}>
              Control Room
            </span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-blue-600 font-medium">Add Resources</span>
          </div>
        </div>

        {/* Title Frame */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Resources</h1>

        {/* Global Warning Canvas notifications */}
        {globalError && (
          <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded-r-lg text-sm font-medium">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
              fields.length === 0 ? "h-95" : "py-4 bg-gray-50/50"
            } ${isDragActive ? "border-blue-500 bg-blue-50/40" : "border-gray-200 bg-white hover:bg-gray-50/50"}`}
          >
            <input {...getInputProps()} />
            <HiSquare3Stack3D className="w-10 h-10 text-blue-500 mb-3" />
            <p className="text-sm font-semibold text-gray-700">Click or drag file to this area to upload</p>
            <p className="text-xs text-gray-400 mt-1">Support for a single or bulk upload within 10MB.</p>
          </div>

          {/* Dynamic Configuration List View Panel Block */}
          {fields.length > 0 && (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const currentCategory = watchedResources[index]?.category;
                const currentToolId = watchedResources[index]?.tool;

                // Find currently active item profiles to pull asset source links
                const selectedToolItem = tools.find((t) => t._id === currentToolId);
                const selectedCategoryItem = categories.find((c) => c._id === currentCategory);

                return (
                  <div key={field.id} className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm space-y-4 relative">
                    
                    {/* Element Configuration Control Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Name & Size Matrix info */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 break-all">{watchedResources[index]?.fileName}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{watchedResources[index]?.fileSize}MB</p>
                      </div>

                      {/* Dropdown Options Segment Array Block */}
                      <div className="flex flex-wrap items-center gap-3">
                        
                        {/* ================= CUSTOM TOOLS LIST DROPDOWN ================= */}
                        <Controller
                          control={control}
                          name={`resources.${index}.tool`}
                          render={({ field: toolField }) => {
                            const isOpen = activeDropdown?.index === index && activeDropdown?.type === "tool";
                            const toolHoverText = selectedToolItem?.name ?? "Tools";
                            return (
                              <div className="relative group/tooltip">
                                <button
                                  type="button"
                                  onClick={() => setActiveDropdown(isOpen ? null : { index, type: "tool" })}
                                  className={`w-12 h-9 border rounded-lg transition-all flex items-center justify-center bg-white cursor-pointer ${
                                    errors.resources?.[index]?.tool 
                                      ? "border-red-500 ring-1 ring-red-200" 
                                      : isOpen 
                                        ? "border-blue-500 ring-1 ring-blue-100" 
                                        : "border-gray-200 hover:border-blue-500"
                                  }`}
                                >
                                  {selectedToolItem?.logo ? (
                                    <img src={selectedToolItem.logo} alt="" className="w-5 h-5 object-contain rounded-sm" />
                                  ) : (
                                    <span className="text-gray-400 font-bold text-lg"><HiOutlinePlusCircle /></span>
                                  )}
                                </button>

                                {/* White Message Tooltip on Hover */}
                                {!isOpen && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-30 drop-shadow-md pointer-events-none">
                                    <div className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-100 whitespace-nowrap shadow-sm">
                                      {toolHoverText}
                                    </div>
                                    <div className="w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45 -mt-1" />
                                  </div>
                                )}

                                {/* Custom Dropdown Popover List Menu (Logo + Name Layout) */}
                                {isOpen && (
                                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">Select Tool</div>
                                    {tools.map((t) => (
                                      <button
                                        key={t._id}
                                        type="button"
                                        onClick={() => {
                                          toolField.onChange(t._id);
                                          setActiveDropdown(null);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-sm rounded-lg transition-colors cursor-pointer my-0.5 ${
                                          t._id === currentToolId ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        {t.logo && <img src={t.logo} alt="" className="w-4 h-4 object-contain rounded-sm" />}
                                        <span className="truncate">{t.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />

                        {/* ================= CUSTOM RESOURCE CATEGORY DROPDOWN ================= */}
                        <Controller
                          control={control}
                          name={`resources.${index}.category`}
                          render={({ field: catField }) => {
                            const isOpen = activeDropdown?.index === index && activeDropdown?.type === "category";
                            const categoryHoverText = selectedCategoryItem?.name ?? "Add Type";
                            return (
                              <div className="relative group/tooltip">
                                <button
                                  type="button"
                                  onClick={() => setActiveDropdown(isOpen ? null : { index, type: "category" })}
                                  className={`w-12 h-9 border rounded-lg transition-all flex items-center justify-center bg-white cursor-pointer ${
                                    errors.resources?.[index]?.category 
                                      ? "border-red-500 ring-1 ring-red-200" 
                                      : isOpen 
                                        ? "border-blue-500 ring-1 ring-blue-100" 
                                        : "border-gray-200 hover:border-blue-500"
                                  }`}
                                >
                                  {selectedCategoryItem?.image ? (
                                    <img src={selectedCategoryItem.image} alt="" className="w-5 h-5 object-contain" />
                                  ) : (
                                    <span className="text-gray-400 text-lg"><LuFileStack /></span>
                                  )}
                                </button>

                                {/* White Message Tooltip on Hover */}
                                {!isOpen && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-30 drop-shadow-md pointer-events-none">
                                    <div className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-100 whitespace-nowrap shadow-sm">
                                      {categoryHoverText}
                                    </div>
                                    <div className="w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45 -mt-1" />
                                  </div>
                                )}

                                {/* Custom Dropdown Popover List Menu (Logo + Name Layout) */}
                                {isOpen && (
                                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">Select Category</div>
                                    {categories.map((cat) => (
                                      <button
                                        key={cat._id}
                                        type="button"
                                        onClick={() => {
                                          catField.onChange(cat._id);
                                          setValue(`resources.${index}.resourceType`, ""); 
                                          setActiveDropdown(null);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-sm rounded-lg transition-colors cursor-pointer my-0.5 ${
                                          cat._id === currentCategory ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        {cat.image && <img src={cat.image} alt="" className="w-4 h-4 object-contain" />}
                                        <span className="truncate">{cat.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />

                        {/* Inline Customizable Input Resource Name Label */}
                        <Controller
                          control={control}
                          name={`resources.${index}.resourceName`}
                          render={({ field: nameField }) => (
                            <input
                              {...nameField}
                              type="text"
                              placeholder="Resource Name"
                              className={`w-44 px-3 py-2 border rounded-lg text-sm bg-white text-gray-700 outline-none transition-all ${
                                errors.resources?.[index]?.resourceName ? "border-red-500 ring-1 ring-red-200" : "border-gray-200 focus:border-blue-500"
                              }`}
                            />
                          )}
                        />

                        {/* Async Loaded Dependent Resource Type Selector Module */}
                        <ResourceTypeSelector index={index} categoryId={currentCategory} />

                        {/* Element Row Deletion Trigger Button */}
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-1"
                        >
                          <X className="w-4 h-4 text-red-500 cursor-pointer" />
                        </button>
                      </div>
                    </div>

                    {/* Meta Field Text Areas (Purpose and Instructions) */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <Controller
                          control={control}
                          name={`resources.${index}.toolPurpose`}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              placeholder="Tool Purpose"
                              rows={2}
                              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-700 outline-none transition-all resize-none ${
                                errors.resources?.[index]?.toolPurpose ? "border-red-500 ring-1 ring-red-200" : "border-gray-200 focus:border-blue-500"
                              }`}
                            />
                          )}
                        />
                        {/* Dynamic error layout block underneath input */}
                        {errors.resources?.[index]?.toolPurpose ? (
                          <p className="text-[11px] text-red-500 mt-1 font-medium">
                            {errors.resources[index].toolPurpose.message}
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 mt-1">Keep tool purpose under 250 characters.</p>
                        )}
                      </div>

                      <div>
                        <Controller
                          control={control}
                          name={`resources.${index}.instruction`}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              placeholder="Add Instruction (optional)"
                              rows={2}
                              className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 outline-none transition-all resize-none focus:border-blue-500 ${
                                errors.resources?.[index]?.instruction ? "border-red-500 ring-1 ring-red-200" : ""
                              }`}
                            />
                          )}
                        />
                        <p className="text-[11px] text-gray-400 mt-1">Keep instruction under 250 characters.</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Action Submissions Options Footer Bar Panel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => router.push(`/dashboard/products/${productId}/control-room`)}
              className="px-5 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={fields.length === 0 || isSubmitting}
              className="px-5 py-2 bg-blue-600 text-sm font-medium rounded-lg text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? "Uploading Documents..." : "Add Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}