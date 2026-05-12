"use client";

import Button from "@/components/Button/Button";
import axiosInstance from "@/lib/axios";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { FaSearch, FaPlus } from "react-icons/fa";

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

const ProductsPage = () => {
  // ================= STATES =================

  // input field value
  const [inputSearch, setInputSearch] = useState("");

  // actual api search value
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  // ================= FETCH PRODUCTS =================

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", search, statusFilter],

    queryFn: async () => {
      const response = await axiosInstance.get("/product/list", {
        params: {
          page: 1,
          size: 10,
          query: search,

          filterBy: statusFilter === "All" ? "" : statusFilter,
        },
      });

      return response.data;
    },
  });

  // ================= PRODUCTS =================

  const products: Product[] = data?.data || [];

  // ================= HANDLE SEARCH =================

  const handleSearch = () => {
    setSearch(inputSearch);
  };

  // ================= ENTER SEARCH =================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(inputSearch);
    }
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

        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by product or company"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 outline-none bg-white"
            />
          </div>

          {/*SEARCH BUTTON*/}

          <button
            onClick={handleSearch}
            className="bg-gray-300 hover:bg-blue-600 px-5 py-2 rounded-lg font-medium cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* RIGHT */}

        <div className="flex gap-3">
          {/* FILTER */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white outline-none"
          >
            <option value="All">All</option>

            <option value="draft">Draft</option>

            <option value="signed">Signed</option>

            <option value="completed">Completed</option>

            <option value="amended">Amended</option>
          </select>

          {/* BUTTON */}

          <Button
            variant="primary"
            size="md"
            className="cursor-pointer flex items-center gap-2"
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

                      <button className="text-blue-600">Control room</button>
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
        <p>Showing {products.length} results</p>
      </div>
    </div>
  );
};

export default ProductsPage;
