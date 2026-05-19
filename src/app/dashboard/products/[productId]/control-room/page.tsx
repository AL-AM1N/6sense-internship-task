"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useParams } from "next/navigation";

// Import custom reusable components
import SearchBar from "@/components/common/SearchBar";
import FilterSelect from "@/components/common/FilterSelect";
import Pagination from "@/components/common/Pagination";

import { Edit2, ChevronRight, Info } from "lucide-react";
import { Category, Resource, ResourceType, Tool } from "./type";

const PAGE_SIZE = 10;

export default function ControlRoomPage() {
  // Extract productId from the URL route parameters
  const params = useParams();
  const productId = params.productId as string;

  // ================= STATES =================
  const [selectedCategory, setSelectedCategory] = useState<string>("664762bd7c3be2fc14f93616");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [inputSearch, setInputSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Track individual row checkmarks manually by Resource ID
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  
  // Tracks the dropdown filter value ("All" or a specific ResourceType ID)
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("All");
  
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ================= API QUERIES =================

  // Fetch Category List
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", productId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/product/category-list/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });

  // Fetch Tools List
  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ["tools", selectedCategory, productId],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await axiosInstance.get(
        `/resource/tools/resource-category?categoryId=${selectedCategory}&productId=${productId}`,
      );
      return response.data;
    },
    enabled: !!productId && !!selectedCategory,
  });

  // Fetch Dropdown Resource Options
  const { data: resourceTypesData } = useQuery<{ types: ResourceType[] }>({
    queryKey: ["resourceTypes", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return { types: [] };
      const response = await axiosInstance.get(
        `/resource-type/by-category?categoryId=${selectedCategory}`,
      );
      return response.data;
    },
    enabled: !!selectedCategory,
  });

  // Main Data Query: Fetch Resources List
  const { data: resourcesResponse, isLoading } = useQuery({
    queryKey: [
      "resources",
      currentPage,
      searchQuery,
      selectedCategory,
      resourceTypeFilter, 
      selectedTools,
      productId,
    ],
    queryFn: async () => {
      const response = await axiosInstance.get("/resource/list", {
        params: {
          page: currentPage,
          size: PAGE_SIZE,
          query: searchQuery,
          categoryId: selectedCategory,
          filterBy: resourceTypeFilter === "All" ? "" : resourceTypeFilter,
          toolId: selectedTools.join(","),
          productId: productId,
        },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  const resources: Resource[] = resourcesResponse?.data || [];
  const totalResults = resourcesResponse?.count || 0;
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  // Helper variables for table master checkbox header
  const totalVisibleItemsCount = resources.length;
  const selectedVisibleCount = resources.filter(res => selectedResourceIds.includes(res._id)).length;
  const isEveryRowChecked = totalVisibleItemsCount > 0 && selectedVisibleCount === totalVisibleItemsCount;

  // ================= SELECTION EVENT HANDLERS =================
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTools([]);
    setSelectedResourceIds([]);
    setResourceTypeFilter("All");
    setCurrentPage(1);
  };

  const handleToolToggle = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId],
    );
    setCurrentPage(1);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(inputSearch);
    setCurrentPage(1);
  };

  // Guard view if path param is missing
  if (!productId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 animate-pulse">Resolving product instance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans antialiased text-gray-900">
      <div className="mx-auto max-w-7xl bg-white p-6">
        {/* Breadcrumb Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Products</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-blue-600 font-medium">Control Room</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Smart Solutions Control Room</h1>

        {/* CATEGORIES SECTION */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = cat._id === selectedCategory;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  {cat.image && <img src={cat.image} alt="" className="w-4 h-4 object-contain" />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* TOOLS SECTION */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Tools</h2>
          <div className="flex flex-wrap gap-2">
            {tools.length > 0 ? (
              tools.map((tool) => {
                const isSelected = selectedTools.includes(tool.toolId);
                return (
                  <button
                    key={tool.toolId}
                    onClick={() => handleToolToggle(tool.toolId)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white font-medium"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  >
                    {tool.logo && (
                      <img
                        src={tool.logo}
                        alt=""
                        className={`w-4 h-4 object-contain rounded-sm ${isSelected ? "brightness-0 invert" : ""}`}
                      />
                    )}
                    <span>{tool.toolName}</span>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 italic">No tools available for this category</p>
            )}
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-gray-800">Resources</h2>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Add Bulk
            </button>
            <button className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-lg text-white hover:bg-blue-700">
              Add Resource
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCHBAR & FILTERSELECT */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <SearchBar
            value={inputSearch}
            onChange={setInputSearch}
            onSearch={handleSearchSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            placeholder="Search by resource name..."
          />

          <FilterSelect
            value={resourceTypeFilter}
            onChange={(val) => {
              setResourceTypeFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { label: "All Resource Types", value: "All" },
              ...(resourceTypesData?.types || []).map((t) => ({
                label: t.name,
                value: t._id,
              })),
            ]}
          />
        </div>

        {/* MAIN DATA TABLE */}
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full min-w-200 border-collapse text-left text-sm text-gray-700">
            <thead>
              <tr className="bg-blue-50/40 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-blue-900/70">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={isEveryRowChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Master header checkbox checks everything currently matching the layout filter
                        const allIds = resources.map((t) => t._id);
                        setSelectedResourceIds(allIds);
                      } else {
                        setSelectedResourceIds([]);
                      }
                    }}
                  />
                </th>
                <th className="py-3 px-4">Resource Name</th>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Resource Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Loading resources...
                  </td>
                </tr>
              ) : resources.length > 0 ? (
                resources.map((res) => {
                  const isChecked = selectedResourceIds.includes(res._id);

                  return (
                    <tr key={res._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedResourceIds((prev) =>
                              prev.includes(res._id)
                                ? prev.filter((id) => id !== res._id) // Uncheck row manually
                                : [...prev, res._id]                  // Check row manually
                            );
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-600">{res.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {res.tool?.logo && (
                            <img src={res.tool.logo} alt="" className="w-4 h-4 object-contain rounded" />
                          )}
                          <span>{res.tool?.name || "N/A"}</span>
                          <Info className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">{res.type?.name || "N/A"}</span>
                          <Info className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {res.created_at
                          ? new Date(res.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3 text-gray-500">
                          <button className="p-1 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:text-blue-600">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No resources found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 text-sm text-gray-500">
          <div>
            Showing {Math.min(resources.length, PAGE_SIZE)} out of {totalResults} results
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}