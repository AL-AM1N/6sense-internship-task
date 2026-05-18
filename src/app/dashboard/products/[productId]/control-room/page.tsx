"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronDown, 
  Edit2, 
  ChevronRight, 
  Info, 
  ChevronLeft 
} from "lucide-react";

// Brand Icon Components using inline SVGs for convenience
const AWSLogo = () => (
  <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5h-2v-2h2v2zm0-4.5h-2V7h2v6z"/>
  </svg>
);

const DrawioLogo = () => (
  <svg className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

const GoogleDocLogo = () => (
  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

const GoogleSheetLogo = () => (
  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
  </svg>
);

const MongoDBLogo = () => (
  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2s-5 4.5-5 9.5c0 3 1.5 5.5 5 7.5 3.5-2 5-4.5 5-7.5C17 6.5 12 2 12 2zm0 14c-1.5-1.2-2.5-3-2.5-4.5h5c0 1.5-1 3.3-2.5 4.5z"/>
  </svg>
);

export default function ControlRoomPage() {
  const [activeCategory, setActiveCategory] = useState("Product Components");

  const categories = [
    { name: "What This Product Does", count: null },
    { name: "How This Product Looks", count: null },
    { name: "Product Components", count: null, hasIcon: true },
    { name: "How This Product Is Built", count: null },
    { name: "How This Product Is Tested", count: null },
    { name: "Security & Compliance", count: null },
    { name: "How This Product Runs", count: null },
  ];

  const tools = [
    { name: "AWS Cloud", logo: <AWSLogo /> },
    { name: "Draw.io", logo: <DrawioLogo /> },
    { name: "Google doc", logo: <GoogleDocLogo />, hasLink: true },
    { name: "Google sheet", logo: <GoogleSheetLogo /> },
    { name: "Draw.io", logo: <DrawioLogo /> },
    { name: "MongoDB", logo: <MongoDBLogo /> },
    { name: "Draw.io", logo: <DrawioLogo /> },
    { name: "Google doc", logo: <GoogleDocLogo /> },
    { name: "Google sheet", logo: <GoogleSheetLogo /> },
    { name: "MongoDB", logo: <MongoDBLogo /> },
  ];

  const resources = [
    { name: "[Resource Name]", tool: "Google Docs", logo: <GoogleDocLogo />, type: "Discussion", date: "16 Jan 2024" },
    { name: "[Resource Name]", tool: "AWS Cloud", logo: <AWSLogo />, type: "Software Architecture", date: "10 Dec 2023" },
    { name: "[Resource Name]", tool: "Google Sheet", logo: <GoogleSheetLogo />, type: "Discussion", date: "22 Nov 2023" },
    { name: "[Resource Name]", tool: "AWS Cloud", logo: <AWSLogo />, type: "Software Architecture", date: "18 Nov 2023" },
    { name: "[Resource Name]", tool: "Draw.io", logo: <DrawioLogo />, type: "Server Architecture", date: "17 Oct 2023" },
    { name: "[Resource Name]", tool: "AWS Cloud", logo: <AWSLogo />, type: "Security Architecture", date: "16 Oct 2023" },
    { name: "[Resource Name]", tool: "Draw.io", logo: <DrawioLogo />, type: "Software Architecture", date: "28 Aug 2023" },
    { name: "[Resource Name]", tool: "Draw.io", logo: <DrawioLogo />, type: "Security Architecture", date: "29 Jul 2023" },
    { name: "[Resource Name]", tool: "AWS Cloud", logo: <AWSLogo />, type: "Software Architecture", date: "06 Apr 2023" },
    { name: "[Resource Name]", tool: "MongoDB", logo: <MongoDBLogo />, type: "Security Architecture", date: "02 Apr 2023" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 p-8 font-sans antialiased text-gray-900">
      <div className="mx-auto max-w-7xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Breadcrumb & User Profile section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Products</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">Control Room</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 border border-gray-200">
            EM
          </div>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-6">
          Smart Solutions Control Room
        </h1>

        {/* Categories Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = cat.name === activeCategory;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                      : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  {cat.hasIcon && (
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Tools</h2>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
              >
                {tool.logo}
                <span>{tool.name}</span>
                {tool.hasLink && (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-semibold text-gray-800">Resources</h2>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Add Bulk
            </button>
            <button className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-lg text-white hover:bg-blue-700">
              Add Resource
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by resource name, tool"
              className="w-full pl-9 pr-20 py-2 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button className="absolute right-1 top-1 bottom-1 px-3 bg-gray-100 hover:bg-gray-200 border-l border-gray-200 text-xs font-medium rounded-r-md text-gray-600">
              Search
            </button>
          </div>
          <div className="relative w-full sm:w-64">
            <select className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Filter by resource type</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Data Table Container */}
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full min-w-200 border-collapse text-left text-sm text-gray-700">
            <thead>
              <tr className="bg-blue-50/40 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-blue-900/70">
                <th className="py-3 px-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="py-3 px-4">Resource Name</th>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Resource Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map((res, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-600">{res.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {res.logo}
                      <span>{res.tool}</span>
                      <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">{res.type}</span>
                      <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{res.date}</td>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 text-sm text-gray-500">
          <div>Showing 10 out of 100</div>
          
          <div className="flex items-center gap-1">
            <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">2</button>
            <span className="px-1 text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-500 bg-blue-50 text-blue-600 font-semibold">5</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">6</button>
            <button className="p-2 border border-gray-200 rounded-lg bg-white text-blue-600 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}