"use client";

import { FaSearch } from "react-icons/fa";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  onSearch,
  onKeyDown,
  placeholder = "Search...",
}: Props) => {
  return (
    <div className="flex flex-1 gap-3">
      {/* INPUT */}
      <div className="relative flex-1">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 outline-none bg-white"
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={onSearch}
        className="bg-gray-300 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg font-medium cursor-pointer transition"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;