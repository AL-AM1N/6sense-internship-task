"use client";

import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CircleAlert, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

// ================= TYPES =================

interface Role {
  _id: string;
  name?: string;
}

interface TeamStructure {
  _id: string;
  role: Role;
  employeeRoleId: string;
  internalRate: number;
  billRate: number;
}

interface RateSheet {
  _id: string;
  name?: string;
  teamStructures: TeamStructure[];
}

interface Company {
  _id: string;
  name: string;
}

interface TeamMember {
  _id: string;
  name: string;
}

// ================= ZOD SCHEMA =================

const schema = z.object({
  // PRODUCT INFO
  company: z.string().min(1, "Company is required"),
  productName: z.string().min(1, "Product name is required"),
  productDetails: z.string().min(1, "Product details is required"),

  // CONTRACT INFO
  contractName: z.string().min(1, "Contract name is required"),
  status: z.string().min(1, "Status is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),

  // FINANCIAL
  rateSheet: z.string().min(1, "Rate sheet is required"),
  safeAgreementAmount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  valuationCapitalAmount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  discount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),

  // DYNAMIC PRODUCT EMPLOYEES
  productEmployees: z.array(
    z.object({
      teamRateId: z.string(),
      name: z.string(),
      employeeRoleId: z.string(),
      employeeId: z.string().min(1, "Team member is required"),
      employmentStatus: z.string().min(1, "Work type is required"),
      internalRate: z.number(),
      billRate: z.number(),
      startDate: z.string().min(1, "Member start date is required"),
      endDate: z.string().optional(),
    })
  ),

  // LEGAL DOCS
  useDocumentLinks: z.boolean().optional(),
  documentLinks: z
    .array(
      z.object({
        url: z.string().optional(),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof schema>;

const CreateProductPage = () => {
  const router = useRouter();

  // ================= STATE =================

  const [selectedRateSheet, setSelectedRateSheet] = useState<RateSheet | null>(null);
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({});
  const [membersSaved, setMembersSaved] = useState(false);

  // ================= FORM CONFIGURATION =================

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
      const response = await axiosInstance.get(`/rate-sheet/details/${selectedRateSheetId}`);
      return response.data;
    },
    enabled: !!selectedRateSheetId,
  });

  // Sync details into UI tracking fields array
  useEffect(() => {
    setSelectedRateSheet(rateSheetDetails || null);

    if (rateSheetDetails?.teamStructures) {
      const initializedFields = rateSheetDetails.teamStructures.map((structure: any) => ({
        teamRateId: structure._id,
        name: structure.role?.name || "Unknown Role",
        employeeRoleId: structure.employeeRoleId,
        employeeId: "", 
        employmentStatus: "", 
        internalRate: structure.internalRate,
        billRate: structure.billRate,
        startDate: "", 
        endDate: "",
      }));
      
      replaceEmployees(initializedFields);
      setMembersSaved(false);
    } else {
      replaceEmployees([]);
    }
  }, [rateSheetDetails, replaceEmployees]);

  // Fetch Team Members context for specific active structures
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedRateSheet?.teamStructures) return;

      const membersData: { [key: string]: TeamMember[] } = {};

      for (const structure of selectedRateSheet.teamStructures) {
        try {
          const response = await axiosInstance.get(
            `/employee/list/active/roleId?roleId=${structure.employeeRoleId}`
          );
          membersData[structure._id] = response.data;
        } catch (error) {
          console.error(error);
          membersData[structure._id] = [];
        }
      }
      setTeamMembers(membersData);
    };

    fetchTeamMembers();
  }, [selectedRateSheet]);

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
    const payload = {
      companyId: data.company,
      productName: data.productName,
      productDetails: data.productDetails,
      contractName: data.contractName,
      contractStatus: data.status,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : "",
      safeAgreementAmount: data.safeAgreementAmount || 0,
      valuationCapitalAmount: data.valuationCapitalAmount || 0,
      discount: data.discount || 0,
      rateSheetId: data.rateSheet,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : "",
      documentLink: "",
      documentKey: "",
      linksToShare: data.documentLinks?.map((item) => item.url).filter(Boolean) || [],
      productEmployees: {
        assignedEmployees: data.productEmployees.map((emp) => ({
          _id: emp.teamRateId,
          teamRateId: emp.teamRateId,
          name: emp.name,
          employeeRoleId: emp.employeeRoleId,
          employeeId: emp.employeeId,
          employmentStatus: emp.employmentStatus,
          internalRate: emp.internalRate,
          billRate: emp.billRate,
          startDate: emp.startDate ? new Date(emp.startDate).toISOString() : "",
          endDate: emp.endDate ? new Date(emp.endDate).toISOString() : "",
        })),
      },
    };

    console.log("Constructed Payload Target:", payload);
    alert("Product Created Successfully");
  };

  // ================= STYLE DEFINITIONS =================

  const inputStyle = `
    w-full
    h-11
    border
    border-[#E4E7EC]
    rounded-md
    px-4
    text-[14px]
    outline-none
    bg-white
    placeholder:text-[#98A2B3]
    focus:border-[#1570EF]
  `;

  const errorInputStyle = `
    border-[#F04438]
  `;

  // ================= RENDER JSX =================

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl">
      {/* PAGE TITLE */}
      <div className="mb-8">
        <p className="text-sm text-gray-500">Products &gt; <span className="text-blue-500">Create</span></p>
        <h1 className="text-3xl font-bold mt-2">Add Product</h1>
      </div>

      <div className="max-w-180 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          
          {/* PRODUCT INFORMATION */}
          <div>
            <h2 className="text-xl font-semibold text-[#101828] mb-8">Product Information</h2>
            <div className="space-y-6">
              {/* COMPANY */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Company <span className="text-[#F04438]">*</span>
                </label>
                <div>
                  <select
                    {...register("company")}
                    className={`${inputStyle} ${errors.company ? errorInputStyle : ""}`}
                  >
                    <option value="">Select</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {errors.company && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.company.message}
                    </p>
                  )}
                </div>
              </div>

              {/* PRODUCT NAME */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Product Name <span className="text-[#F04438]">*</span>
                </label>
                <div>
                  <input
                    type="text"
                    placeholder="Product name"
                    {...register("productName")}
                    className={`${inputStyle} ${errors.productName ? errorInputStyle : ""}`}
                  />
                  {errors.productName && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.productName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* PRODUCT DETAILS */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <div className="flex justify-end items-center gap-1 pt-3">
                  <label className="text-[14px] text-right font-medium text-[#344054]">
                    Product Details <span className="text-[#F04438]">*</span>
                  </label>
                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>
                <div>
                  <textarea
                    rows={5}
                    placeholder="Product details"
                    {...register("productDetails")}
                    className={`w-full border rounded-md px-4 py-3 text-[14px] outline-none resize-none placeholder:text-[#98A2B3] ${
                      errors.productDetails ? errorInputStyle : "border-[#E4E7EC]"
                    }`}
                  />
                  {errors.productDetails && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.productDetails.message}
                    </p>
                  )}
                  <p className="text-[#667085] text-[12px] mt-2">
                    Keep product details under 250 characters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTRACT INFORMATION */}
          <div>
            <h2 className="text-xl font-semibold text-[#101828] mb-8">Contract Information</h2>
            <div className="space-y-6">
              {/* CONTRACT NAME */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Contract Name <span className="text-[#F04438]">*</span>
                </label>
                <div>
                  <input
                    type="text"
                    placeholder="Contract name"
                    {...register("contractName")}
                    className={`${inputStyle} ${errors.contractName ? errorInputStyle : ""}`}
                  />
                  {errors.contractName && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.contractName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* STATUS */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Status <span className="text-[#F04438]">*</span>
                </label>
                <div>
                  <select
                    {...register("status")}
                    className={`${inputStyle} ${errors.status ? errorInputStyle : ""}`}
                  >
                    <option value="">Select</option>
                    <option value="draft">Draft</option>
                    <option value="signed">Signed</option>
                    <option value="completed">Completed</option>
                    <option value="amended">Amended</option>
                  </select>
                  {errors.status && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              {/* START DATE */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <div className="flex justify-end items-center gap-1 pt-3">
                  <label className="text-[14px] text-right font-medium text-[#344054]">
                    Start Date <span className="text-[#F04438]">*</span>
                  </label>
                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>
                <div>
                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                    />
                    <input
                      type="date"
                      {...register("startDate")}
                      className={`${inputStyle} pl-11 ${errors.startDate ? errorInputStyle : ""}`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* END DATE */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <div className="flex justify-end items-center gap-1 pt-3">
                  <label className="text-[14px] text-right font-medium text-[#344054]">End Date</label>
                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>
                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                  />
                  <input type="date" {...register("endDate")} className={`${inputStyle} pl-11`} />
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL TERMS */}
          <div>
            <h2 className="text-xl font-semibold text-[#101828] mb-8">Financial Terms</h2>
            <div className="space-y-6">
              {/* SAFE TERMS */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">SAFE Terms</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    {...register("safeAgreementAmount")}
                    className={`${inputStyle} pl-8 pr-14`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]">USD</span>
                </div>
              </div>

              {/* VALUATION */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">Valuation Cap</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085]">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    {...register("valuationCapitalAmount")}
                    className={`${inputStyle} pl-8 pr-14`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]">USD</span>
                </div>
              </div>

              {/* DISCOUNT */}
              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">Discount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    {...register("discount")}
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
                  {errors.rateSheet && (
                    <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                      <CircleAlert size={14} />
                      {errors.rateSheet.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RATE SHEET CONDITIONAL LOOP COMPONENT SECTION */}
          {selectedRateSheet && employeeFields.length > 0 && (
            <div className="border border-[#EAECF0] rounded-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[#EAECF0] bg-[#FCFCFD] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-[#101828]">{selectedRateSheet.name}</h3>
                  <span className="text-[#667085] text-[14px]">With {employeeFields.length} roles</span>
                </div>
                <button
                  type="button"
                  onClick={membersSaved ? handleChangeMembers : handleSaveMembers}
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
                          {...register(`productEmployees.${index}.employeeId` as const)}
                          className={`${inputStyle} ${
                            errors.productEmployees?.[index]?.employeeId ? errorInputStyle : ""
                          }`}
                        >
                          <option value="">Select</option>
                          {teamMembers[field.teamRateId]?.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                        {errors.productEmployees?.[index]?.employeeId && (
                          <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                            <CircleAlert size={14} />
                            {errors.productEmployees[index]?.employeeId?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          Work Type <span className="text-[#F04438]">*</span>
                        </label>
                        <select
                          {...register(`productEmployees.${index}.employmentStatus` as const)}
                          className={`${inputStyle} ${
                            errors.productEmployees?.[index]?.employmentStatus ? errorInputStyle : ""
                          }`}
                        >
                          <option value="">Select</option>
                          <option value="FULL_TIME">Full Time</option>
                          <option value="PART_TIME">Part Time</option>
                        </select>
                        {errors.productEmployees?.[index]?.employmentStatus && (
                          <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                            <CircleAlert size={14} />
                            {errors.productEmployees[index]?.employmentStatus?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mt-5">
                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          Start Date <span className="text-[#F04438]">*</span>
                        </label>
                        <input
                          type="date"
                          {...register(`productEmployees.${index}.startDate` as const)}
                          className={`${inputStyle} ${
                            errors.productEmployees?.[index]?.startDate ? errorInputStyle : ""
                          }`}
                        />
                        {errors.productEmployees?.[index]?.startDate && (
                          <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                            <CircleAlert size={14} />
                            {errors.productEmployees[index]?.startDate?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          {...register(`productEmployees.${index}.endDate` as const)}
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}

              {membersSaved && (
                <div className="p-6 bg-emerald-50 text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <span>✓ Dynamic layout values successfully verified and stored locally in context.</span>
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* LEGAL DOCUMENTS (Restored Layout Fragment) */}
          {/* ================================================= */}
          <div>
            <h2 className="text-xl font-semibold text-[#101828] mb-8">
              Legal Documents
            </h2>

            <div className="grid grid-cols-[180px_1fr] gap-6">
              <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                Upload Doc
              </label>

              <div>
                {/* FILE INPUT */}
                <input
                  type="file"
                  disabled={useDocumentLinks}
                  className={`
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
                  `}
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

                        {/* REMOVE BUTTON */}
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

                    {/* ADD MORE BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        appendDocumentLink({
                          url: "",
                        })
                      }
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
              </div>
            </div>
          </div>

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