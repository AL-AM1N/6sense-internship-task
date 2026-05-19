"use client";

import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CircleAlert, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Company, RateSheet, TeamMember } from "./types";
import { FormValues, schema } from "./schema";
import { errorInputStyle, inputStyle } from "@/lib/form-styles";
import FormSection from "@/components/product-form/FormSection";
import FormRow from "@/components/product-form/FormRow";
import InputField from "@/components/product-form/InputField";
import SelectField from "@/components/product-form/SelectField";
import { mapProductPayload } from "@/lib/mappers/product.mapper";
import FormError from "@/components/product-form/FormError";

const CreateProductPage = () => {
  const router = useRouter();

  const [membersSaved, setMembersSaved] = useState(false);

  // FORM CONFIGURATION

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      useDocumentLinks: false,
      documentLinks: [{ url: "" }],
      productEmployees: [],
      safeAgreementAmount: undefined,
      valuationCapitalAmount: undefined,
      discount: undefined,
    },
  });

  // Document Links Array Handler
  const {
    fields: documentLinkFields,
    append: appendDocumentLink,
    remove: removeDocumentLink,
  } = useFieldArray({
    control,
    name: "documentLinks",
  });

  // Dynamic Product Employees Array Handler
  const {
    fields: employeeFields,
    replace: replaceEmployees,
    remove: removeEmployeeField,
  } = useFieldArray({
    control,
    name: "productEmployees",
  });

  const useDocumentLinks = watch("useDocumentLinks");
  const selectedRateSheetId = watch("rateSheet");

  // ================= DATA FETCHING (QUERIES) =================

  // Company List Dropdown
  const { data: companyData } = useQuery({
    queryKey: ["company-dropdown"],
    queryFn: async () => {
      const response = await axiosInstance.get("/company/list/dropdown");
      return response.data;
    },
  });
  const companies: Company[] = companyData || [];

  // Rate Sheet List Dropdown
  const { data: rateSheetData } = useQuery({
    queryKey: ["rate-sheet-dropdown"],
    queryFn: async () => {
      const response = await axiosInstance.get("/rate-sheet/list/dropdown");
      return response.data.data;
    },
  });
  const rateSheets: RateSheet[] = rateSheetData || [];

  // Rate Sheet Complete Structural Details
  const { data: rateSheetDetails } = useQuery({
    queryKey: ["rate-sheet-details", selectedRateSheetId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/rate-sheet/details/${selectedRateSheetId}`,
      );
      return response.data;
    },
    enabled: !!selectedRateSheetId,
  });

  const selectedRateSheet = rateSheetDetails;

  // Sync details into UI tracking fields array
  useEffect(() => {
    if (rateSheetDetails?.teamStructures) {
      const initializedFields = rateSheetDetails.teamStructures.map(
        (structure: any) => ({
          teamRateId: structure._id,
          name: structure.role?.name || "Unknown Role",
          employeeRoleId: structure.employeeRoleId,
          employeeId: "",
          employmentStatus: "",
          internalRate: structure.internalRate,
          billRate: structure.billRate,
          startDate: "",
          endDate: "",
        }),
      );

      replaceEmployees(initializedFields);
      setMembersSaved(false);
    } else {
      replaceEmployees([]);
    }
  }, [rateSheetDetails, replaceEmployees]);

  // Fetch Team Members context for specific active structures
  const { data: teamMembers = {} } = useQuery({
    queryKey: ["team-members", selectedRateSheetId],

    enabled: !!rateSheetDetails?.teamStructures,

    queryFn: async () => {
      const membersData: Record<string, TeamMember[]> = {};

      await Promise.all(
        rateSheetDetails.teamStructures.map(async (structure: any) => {
          try {
            const response = await axiosInstance.get(
              `/employee/list/active/roleId?roleId=${structure.employeeRoleId}`,
            );

            membersData[structure._id] = response.data;
          } catch (error) {
            console.error(error);
            membersData[structure._id] = [];
          }
        }),
      );

      return membersData;
    },
  });

  // ================= ACTIONS =================

  const handleSaveMembers = async () => {
    const isValid = await trigger("productEmployees");
    if (isValid) {
      setMembersSaved(true);
    }
  };

  const handleChangeMembers = () => {
    setMembersSaved(false);
  };

  const handleRemoveStructure = (index: number) => {
    removeEmployeeField(index);
  };

  // ================= SUBMIT AND MAP PAYLOAD =================

  const onSubmit = (data: FormValues) => {
    const payload = mapProductPayload(data);

    console.log("Constructed Payload Target:", payload);
    alert("Product Created Successfully");
  };

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl">
      {/* PAGE TITLE */}
      <div className="mb-8">
        <p className="text-sm text-gray-500">
          Products &gt; <span className="text-blue-500">Create</span>
        </p>
        <h1 className="text-3xl font-bold mt-2">Add Product</h1>
      </div>

      <div className="max-w-180 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* PRODUCT INFORMATION */}
          <FormSection title="Product Information">
            {/* COMPANY */}
            <FormRow
              label={
                <>
                  Company <span className="text-[#F04438]">*</span>
                </>
              }
            >
              <SelectField
                register={register("company")}
                options={companies.map((company) => ({
                  label: company.name,
                  value: company._id,
                }))}
                error={errors.company?.message}
              />
            </FormRow>

            {/* PRODUCT NAME */}
            <FormRow
              label={
                <>
                  Product Name <span className="text-[#F04438]">*</span>
                </>
              }
            >
              <InputField
                placeholder="Product name"
                register={register("productName")}
                error={errors.productName?.message}
              />
            </FormRow>

            {/* PRODUCT DETAILS */}
            <FormRow
              label={
                <div className="flex justify-end items-center gap-1">
                  <span>
                    Product Details <span className="text-[#F04438]">*</span>
                  </span>

                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>
              }
            >
              <div>
                <textarea
                  rows={5}
                  placeholder="Product details"
                  {...register("productDetails")}
                  className={`w-full border rounded-md px-4 py-3 text-[14px] outline-none resize-none placeholder:text-[#98A2B3] ${
                    errors.productDetails ? errorInputStyle : "border-[#E4E7EC]"
                  }`}
                />

                <FormError message={errors.productDetails?.message} />

                <p className="text-[#667085] text-[12px] mt-2">
                  Keep product details under 250 characters.
                </p>
              </div>
            </FormRow>
          </FormSection>

          {/* CONTRACT INFORMATION */}
          <FormSection title="Contract Information">
            {/* CONTRACT NAME */}
            <FormRow
              label={
                <>
                  Contract Name <span className="text-[#F04438]">*</span>
                </>
              }
            >
              <InputField
                placeholder="Contract name"
                register={register("contractName")}
                error={errors.contractName?.message}
              />
            </FormRow>

            {/* STATUS */}
            <FormRow
              label={
                <>
                  Status <span className="text-[#F04438]">*</span>
                </>
              }
            >
              <SelectField
                register={register("status")}
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Signed", value: "signed" },
                  { label: "Completed", value: "completed" },
                  { label: "Amended", value: "amended" },
                ]}
                error={errors.status?.message}
              />
            </FormRow>

            {/* START DATE */}
            <FormRow
              label={
                <div className="flex justify-end items-center gap-1">
                  <span>
                    Start Date <span className="text-[#F04438]">*</span>
                  </span>

                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>
              }
            >
              <div>
                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                  />

                  <input
                    type="date"
                    {...register("startDate")}
                    className={`${inputStyle} pl-11 ${
                      errors.startDate ? errorInputStyle : ""
                    }`}
                  />
                </div>

                <FormError message={errors.startDate?.message} />
              </div>
            </FormRow>

            {/* END DATE */}
            <FormRow
              label={
                <div className="flex justify-end items-center gap-1">
                  <span>End Date</span>

                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>
              }
            >
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                />

                <input
                  type="date"
                  {...register("endDate")}
                  className={`${inputStyle} pl-11`}
                />
              </div>
            </FormRow>
          </FormSection>

          {/* FINANCIAL TERMS */}
          <div>
            <h2 className="text-xl font-semibold text-[#101828] mb-8">
              Financial Terms
            </h2>
            <div className="space-y-6">
              {/* SAFE TERMS */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  SAFE Terms
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    // {...register("safeAgreementAmount")}
                    {...register("safeAgreementAmount", {
                      valueAsNumber: true,
                    })}
                    className={`${inputStyle} pl-8 pr-14`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]">
                    USD
                  </span>
                </div>
              </div>

              {/* VALUATION */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Valuation Cap
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    // {...register("valuationCapitalAmount")}
                    {...register("valuationCapitalAmount", {
                      valueAsNumber: true,
                    })}
                    className={`${inputStyle} pl-8 pr-14`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]">
                    USD
                  </span>
                </div>
              </div>

              {/* DISCOUNT */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Discount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    // {...register("discount")}
                    {...register("discount", {
                      valueAsNumber: true,
                    })}
                    className={`${inputStyle} pr-32`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] text-[14px]">
                    % (Percentage)
                  </span>
                </div>
              </div>

              {/* RATE SHEET SELECTION */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Rate Sheet <span className="text-[#F04438]">*</span>
                </label>
                <div>
                  <select
                    {...register("rateSheet")}
                    className={`${inputStyle} ${errors.rateSheet ? errorInputStyle : ""}`}
                  >
                    <option value="">Select</option>
                    {rateSheets.map((sheet) => (
                      <option key={sheet._id} value={sheet._id}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>

                  <FormError message={errors.rateSheet?.message} />
                </div>
              </div>
            </div>
          </div>

          {/* RATE SHEET CONDITIONAL LOOP COMPONENT SECTION */}
          {selectedRateSheet && employeeFields.length > 0 && (
            <div className="border border-[#EAECF0] rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#EAECF0] bg-[#FCFCFD] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-[#101828]">
                    {selectedRateSheet.name}
                  </h3>
                  <span className="text-[#667085] text-[14px]">
                    With {employeeFields.length} roles
                  </span>
                </div>
                <button
                  type="button"
                  onClick={
                    membersSaved ? handleChangeMembers : handleSaveMembers
                  }
                  className="text-[#1570EF] text-[14px] font-medium cursor-pointer"
                >
                  {membersSaved ? "Change members" : "Save members"}
                </button>
              </div>

              {!membersSaved &&
                employeeFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`p-6 ${index !== employeeFields.length - 1 ? "border-b border-[#EAECF0]" : ""}`}
                  >
                    <div className="pb-4 flex items-center justify-between">
                      <p className="font-bold text-xl">{field.name}</p>
                      <button
                        type="button"
                        onClick={() => handleRemoveStructure(index)}
                        className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold hover:bg-red-200"
                      >
                        -
                      </button>
                    </div>

                    <div className="flex items-center gap-5 text-[13px] text-[#667085] mb-6">
                      <p>Internal Rate: ${field.internalRate}/month</p>
                      <p>Billing Rate: ${field.billRate}/month</p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          Team Member <span className="text-[#F04438]">*</span>
                        </label>
                        <select
                          {...register(
                            `productEmployees.${index}.employeeId` as const,
                          )}
                          className={`${inputStyle} ${
                            errors.productEmployees?.[index]?.employeeId
                              ? errorInputStyle
                              : ""
                          }`}
                        >
                          <option value="">Select</option>
                          {teamMembers[field.teamRateId]?.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                        <FormError
                          message={
                            errors.productEmployees?.[index]?.employeeId
                              ?.message
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          Work Type <span className="text-[#F04438]">*</span>
                        </label>
                        <select
                          {...register(
                            `productEmployees.${index}.employmentStatus` as const,
                          )}
                          className={`${inputStyle} ${
                            errors.productEmployees?.[index]?.employmentStatus
                              ? errorInputStyle
                              : ""
                          }`}
                        >
                          <option value="">Select</option>
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                        </select>
                        <FormError
                          message={
                            errors.productEmployees?.[index]?.employmentStatus
                              ?.message
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mt-5">
                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          Start Date <span className="text-[#F04438]">*</span>
                        </label>
                        <input
                          type="date"
                          {...register(
                            `productEmployees.${index}.startDate` as const,
                          )}
                          className={`${inputStyle} ${
                            errors.productEmployees?.[index]?.startDate
                              ? errorInputStyle
                              : ""
                          }`}
                        />
                        <FormError
                          message={
                            errors.productEmployees?.[index]?.startDate?.message
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          {...register(
                            `productEmployees.${index}.endDate` as const,
                          )}
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}

              {membersSaved && (
                <div className="p-6 bg-emerald-50 text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <span>
                    ✓ Dynamic layout values successfully verified and stored
                    locally in context.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* LEGAL DOCUMENTS */}
          <FormSection title="Legal Documents">
            <FormRow label={<>Upload Doc</>}>
              {/* FILE INPUT */}
              <input
                type="file"
                disabled={useDocumentLinks}
                className="
        w-full
        h-11
        border
        border-[#E4E7EC]
        rounded-md
        px-3
        py-2
        text-[14px]
        bg-white
        disabled:bg-[#F2F4F7]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
              />

              <p className="text-[12px] text-[#667085] mt-2">
                Any document file can be uploaded within 10MB.
              </p>

              {/* TOGGLE */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useDocumentLinks"
                  {...register("useDocumentLinks")}
                />

                <label
                  htmlFor="useDocumentLinks"
                  className="text-[14px] text-[#344054]"
                >
                  Use link to share document
                </label>
              </div>

              {/* DOCUMENT LINKS */}
              {useDocumentLinks && (
                <div className="mt-5 space-y-4">
                  {documentLinkFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="https://example.com/document"
                        {...register(`documentLinks.${index}.url`)}
                        className={inputStyle}
                      />

                      {documentLinkFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocumentLink(index)}
                          className="
                  w-11
                  h-11
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-red-200
                  text-red-600
                  hover:bg-red-50
                  transition
                "
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => appendDocumentLink({ url: "" })}
                    className="
            flex
            items-center
            gap-2
            text-[#1570EF]
            text-[14px]
            font-medium
            cursor-pointer
          "
                  >
                    <Plus size={16} />
                    Add more
                  </button>
                </div>
              )}
            </FormRow>
          </FormSection>

          {/* ACTION FOOTER */}
          <div className="border-t border-[#F2F4F7] pt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 h-11 border border-[#D0D5DD] rounded-md text-sm font-medium text-[#344054] bg-white hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-11 bg-[#1570EF] text-white rounded-md text-sm font-medium hover:bg-[#125BCE] shadow-sm"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
