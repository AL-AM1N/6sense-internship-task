import { Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import { X } from "lucide-react";
import { LuFileStack } from "react-icons/lu";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { BulkFormValues } from "../bulk-schema";
import { DropdownItem } from "../bulk-type";
import { JSX } from "react";

interface ResourceCardProps {
  index: number;
  control: any;
  errors: FieldErrors<BulkFormValues>;
  watchedResources: any[];
  tools: DropdownItem[];
  categories: DropdownItem[];
  activeDropdown: { index: number; type: "tool" | "category" } | null;
  setActiveDropdown: (value: any) => void;
  remove: (index: number) => void;
  setValue: UseFormSetValue<BulkFormValues>;
  ResourceTypeSelector: ({
    index,
    categoryId,
  }: {
    index: number;
    categoryId: string;
  }) => JSX.Element;
}

export default function ResourceCard({
  index,
  control,
  errors,
  watchedResources,
  tools,
  categories,
  activeDropdown,
  setActiveDropdown,
  remove,
  setValue,
  ResourceTypeSelector,
}: ResourceCardProps) {
  const currentCategory = watchedResources[index]?.category;
  const currentToolId = watchedResources[index]?.tool;

  const selectedToolItem = tools.find((t) => t._id === currentToolId);
  const selectedCategoryItem = categories.find((c) => c._id === currentCategory);

  return (
    <div className="border border-gray-100 rounded-xl bg-white p-5 shadow-sm space-y-4">
      {/* Header with file info and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-800 break-all">
            {watchedResources[index]?.fileName}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {watchedResources[index]?.fileSize}MB
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tool Dropdown */}
          <ToolDropdown
            index={index}
            control={control}
            errors={errors}
            tools={tools}
            selectedToolItem={selectedToolItem}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />

          {/* Category Dropdown */}
          <CategoryDropdown
            index={index}
            control={control}
            errors={errors}
            categories={categories}
            selectedCategoryItem={selectedCategoryItem}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            setValue={setValue}
          />

          {/* Resource Name Input */}
          <Controller
            control={control}
            name={`resources.${index}.resourceName`}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Resource Name"
                className={`w-44 px-3 py-2 border rounded-lg text-sm bg-white text-gray-700 outline-none transition-all ${
                  errors.resources?.[index]?.resourceName
                    ? "border-red-500 ring-1 ring-red-200"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
            )}
          />

          {/* Resource Type Selector */}
          <ResourceTypeSelector index={index} categoryId={currentCategory} />

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => remove(index)}
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tool Purpose and Instruction Textareas */}
      <div className="space-y-3 pt-1">
        <TextAreaField
          control={control}
          name={`resources.${index}.toolPurpose`}
          placeholder="Tool Purpose"
          error={errors.resources?.[index]?.toolPurpose?.message}
          helper="Keep tool purpose under 250 characters."
        />

        <TextAreaField
          control={control}
          name={`resources.${index}.instruction`}
          placeholder="Add Instruction (optional)"
          error={errors.resources?.[index]?.instruction?.message}
          helper="Keep instruction under 250 characters."
        />
      </div>
    </div>
  );
}

// Tool Dropdown Component
function ToolDropdown({
  index,
  control,
  errors,
  tools,
  selectedToolItem,
  activeDropdown,
  setActiveDropdown,
}: {
  index: number;
  control: any;
  errors: any;
  tools: DropdownItem[];
  selectedToolItem?: DropdownItem;
  activeDropdown: any;
  setActiveDropdown: any;
}) {
  const isOpen = activeDropdown?.index === index && activeDropdown?.type === "tool";

  return (
    <Controller
      control={control}
      name={`resources.${index}.tool`}
      render={({ field }) => (
        <div className="relative group/tooltip">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(isOpen ? null : { index, type: "tool" })
            }
            className={`w-12 h-9 border rounded-lg transition-all flex items-center justify-center bg-white cursor-pointer ${
              errors.resources?.[index]?.tool
                ? "border-red-500 ring-1 ring-red-200"
                : isOpen
                  ? "border-blue-500 ring-1 ring-blue-100"
                  : "border-gray-200 hover:border-blue-500"
            }`}
          >
            {selectedToolItem?.logo ? (
              <img
                src={selectedToolItem.logo}
                alt=""
                className="w-5 h-5 object-contain rounded-sm"
              />
            ) : (
              <span className="text-gray-400 text-lg">
                <HiOutlinePlusCircle />
              </span>
            )}
          </button>

          {!isOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-30 drop-shadow-md pointer-events-none">
              <div className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-100 whitespace-nowrap shadow-sm">
                {selectedToolItem?.name ?? "Tools"}
              </div>
              <div className="w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45 -mt-1" />
            </div>
          )}

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                Select Tool
              </div>
              {tools.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => {
                    field.onChange(t._id);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-sm rounded-lg transition-colors cursor-pointer my-0.5 ${
                    t._id === field.value
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t.logo && (
                    <img
                      src={t.logo}
                      alt=""
                      className="w-4 h-4 object-contain rounded-sm"
                    />
                  )}
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}

// Category Dropdown Component
function CategoryDropdown({
  index,
  control,
  errors,
  categories,
  selectedCategoryItem,
  activeDropdown,
  setActiveDropdown,
  setValue,
}: {
  index: number;
  control: any;
  errors: any;
  categories: DropdownItem[];
  selectedCategoryItem?: DropdownItem;
  activeDropdown: any;
  setActiveDropdown: any;
  setValue: any;
}) {
  const isOpen = activeDropdown?.index === index && activeDropdown?.type === "category";

  return (
    <Controller
      control={control}
      name={`resources.${index}.category`}
      render={({ field }) => (
        <div className="relative group/tooltip">
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(isOpen ? null : { index, type: "category" })
            }
            className={`w-12 h-9 border rounded-lg transition-all flex items-center justify-center bg-white cursor-pointer ${
              errors.resources?.[index]?.category
                ? "border-red-500 ring-1 ring-red-200"
                : isOpen
                  ? "border-blue-500 ring-1 ring-blue-100"
                  : "border-gray-200 hover:border-blue-500"
            }`}
          >
            {selectedCategoryItem?.image ? (
              <img
                src={selectedCategoryItem.image}
                alt=""
                className="w-5 h-5 object-contain"
              />
            ) : (
              <span className="text-gray-400 text-lg">
                <LuFileStack />
              </span>
            )}
          </button>

          {!isOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-30 drop-shadow-md pointer-events-none">
              <div className="bg-white text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-gray-100 whitespace-nowrap shadow-sm">
                {selectedCategoryItem?.name ?? "Add Type"}
              </div>
              <div className="w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45 -mt-1" />
            </div>
          )}

          {isOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                Select Category
              </div>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => {
                    field.onChange(cat._id);
                    setValue(`resources.${index}.resourceType`, "");
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-left text-sm rounded-lg transition-colors cursor-pointer my-0.5 ${
                    cat._id === field.value
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  )}
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    />
  );
}

// Textarea Field Component
function TextAreaField({
  control,
  name,
  placeholder,
  error,
  helper,
}: {
  control: any;
  name: string;
  placeholder: string;
  error?: string;
  helper: string;
}) {
  return (
    <div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <textarea
            {...field}
            placeholder={placeholder}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-700 outline-none transition-all resize-none ${
              error
                ? "border-red-500 ring-1 ring-red-200"
                : "border-gray-200 focus:border-blue-500"
            }`}
          />
        )}
      />
      {error ? (
        <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>
      ) : (
        <p className="text-[11px] text-gray-400 mt-1">{helper}</p>
      )}
    </div>
  );
}
