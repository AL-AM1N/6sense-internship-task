"use client";

import Button from "@/components/Button/Button";
import axiosInstance from "@/lib/axios";

import { useQuery } from "@tanstack/react-query";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { FaSearch, FaPlus } from "react-icons/fa";
import SearchBar from "@/components/common/SearchBar";
import FilterSelect from "@/components/common/FilterSelect";
import Pagination from "@/components/common/Pagination";

// ================= TYPES =================

interface Product {
  _id: string;

  name: string;

  details: string;

  created_at: string;

  company: {
    name: string;
  };

  contract: {
    status: string;
  };
}

const PAGE_SIZE = 10;

const ProductsPage = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  // values from URL

  const currentPage = Number(searchParams.get("page")) || 1;

  const currentSearch = searchParams.get("query") || "";

  const currentFilter = searchParams.get("filterBy") || "All";

  // ================= STATES =================

  // ✅ UPDATE: initialize from URL

  const [inputSearch, setInputSearch] = useState(currentSearch);

  const [search, setSearch] = useState(currentSearch);

  const [statusFilter, setStatusFilter] = useState(currentFilter);

  //URL function

  const updateURL = (page: number, query: string, filter: string) => {
    const params = new URLSearchParams();

    params.set("page", page.toString());

    if (query) {
      params.set("query", query);
    }

    if (filter && filter !== "All") {
      params.set("filterBy", filter);
    }

    router.push(`?${params.toString()}`);
  };

  // ================= FETCH PRODUCTS =================

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", currentPage, search, statusFilter],

    queryFn: async () => {
      const response = await axiosInstance.get("/product/list", {
        params: {
          page: currentPage,

          size: PAGE_SIZE,

          query: search,

          filterBy: statusFilter === "All" ? "" : statusFilter,
        },
      });

      return response.data;
    },
  });

  // ================= PRODUCTS =================

  const products: Product[] = data?.data || [];

  // count from API

  const totalResults = data?.count || 0;

  // calculate total pages

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  // pagination numbers

  const pagination: (number | string)[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pagination.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pagination.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pagination.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pagination.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
  }

  // ================= HANDLE SEARCH =================

  const handleSearch = () => {
    setSearch(inputSearch);

    // reset page to 1

    updateURL(1, inputSearch, statusFilter);
  };

  // ================= ENTER SEARCH =================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(inputSearch);

      updateURL(1, inputSearch, statusFilter);
    }
  };

  // filter change

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    setStatusFilter(value);

    updateURL(1, search, value);
  };

  //page change

  const handlePageChange = (page: number) => {
    updateURL(page, search, statusFilter);
  };

  // ================= LOADING =================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        Something went wrong
      </div>
    );
  }

  // ================= STATUS STYLE =================

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "bg-blue-100 text-blue-600";

      case "completed":
        return "bg-green-100 text-green-600";

      case "amended":
        return "bg-purple-100 text-purple-600";

      case "draft":
        return "bg-black text-white";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TOP ================= */}

      <div>
        <p className="text-blue-600 text-sm font-medium">Products</p>

        <h1 className="text-4xl font-bold text-gray-800 mt-1">All Products</h1>
      </div>

      {/* ================= SEARCH + FILTER ================= */}

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* SEARCH */}
        <SearchBar
          value={inputSearch}
          onChange={setInputSearch}
          onSearch={handleSearch}
          onKeyDown={handleKeyDown}
          placeholder="Search by product or company"
        />

        {/* RIGHT */}

        <div className="flex gap-3">
          {/* FILTER */}
          <FilterSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);

              updateURL(1, search, value);
            }}
            options={[
              { label: "All", value: "All" },
              { label: "Draft", value: "draft" },
              { label: "Signed", value: "signed" },
              { label: "Completed", value: "completed" },
              { label: "Amended", value: "amended" },
            ]}
          />

          {/* BUTTON */}

          <Button
            variant="primary"
            size="md"
            className="cursor-pointer flex items-center gap-2"
            onClick={() => router.push("/dashboard/products/create")}
          >
            <FaPlus />
            Add product
          </Button>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
        <table className="w-full min-w-255">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="text-left px-6 py-4 font-semibold">PRODUCT</th>

              <th className="text-left px-6 py-4 font-semibold">COMPANY</th>

              <th className="text-left px-6 py-4 font-semibold">
                CREATED DATE
              </th>

              <th className="text-left px-6 py-4 font-semibold">
                CONTRACT STATUS
              </th>

              <th className="text-left px-6 py-4 font-semibold">ACTION</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm">{item.name}</td>

                  <td className="px-6 py-4 text-sm">{item.company?.name}</td>

                  <td className="px-6 py-4 text-sm">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        item.contract?.status,
                      )}`}
                    >
                      {item.contract?.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-4">
                      <button className="text-gray-700">Details</button>

                      <button
                        className="text-blue-600"
                        onClick={() =>
                          router.push(
                            `/dashboard/products/${item._id}/control-room`,
                          )
                        }
                      >
                        Control room
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= FOOTER ================= */}

      <div className="flex justify-between items-center text-sm text-gray-500">
        {/* LEFT */}

        <p>
          Showing {products.length} out of {totalResults} results
        </p>

        {/* RIGHT */}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
