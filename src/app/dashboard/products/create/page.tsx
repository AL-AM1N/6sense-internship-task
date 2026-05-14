"use client";

import axiosInstance from "@/lib/axios";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery } from "@tanstack/react-query";

import { CalendarDays, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

// ================= TYPES =================

interface TeamStructure {
  _id: string;

  employeeRoleId: string;

  internalRate: number;

  billRate: number;
}

interface RateSheet {
  _id: string;

  name: string;

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

  // FINANCIAL

  rateSheet: z.string().min(1, "Rate sheet is required"),

  // TEAM STRUCTURE

  teamMember: z.string().min(1, "Team member is required"),

  workType: z.string().min(1, "Work type is required"),

  memberStartDate: z.string().min(1, "Member start date is required"),
});

type FormValues = z.infer<typeof schema>;

const CreateProductPage = () => {
  const router = useRouter();
  // ================= STATE =================

  const [selectedRateSheet, setSelectedRateSheet] = useState<RateSheet | null>(
    null,
  );

  const [teamMembers, setTeamMembers] = useState<{
    [key: string]: TeamMember[];
  }>({});

  // ================= FORM =================

  const {
    register,

    handleSubmit,

    watch,

    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // ================= WATCH RATE SHEET =================

  const selectedRateSheetId = watch("rateSheet");

  // ================= COMPANY LIST =================

  const { data: companyData } = useQuery({
    queryKey: ["company-dropdown"],

    queryFn: async () => {
      const response = await axiosInstance.get("/company/list/dropdown");

      return response.data;
    },
  });

  const companies: Company[] = companyData || [];

  // ================= RATE SHEET LIST =================

  const { data: rateSheetData } = useQuery({
    queryKey: ["rate-sheet-dropdown"],

    queryFn: async () => {
      const response = await axiosInstance.get("/rate-sheet/list/dropdown");

      return response.data.data;
    },
  });

  const rateSheets: RateSheet[] = rateSheetData || [];

  // ================= RATE SHEET DETAILS =================

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

  useEffect(() => {
    setSelectedRateSheet(rateSheetDetails || null);
  }, [rateSheetDetails]);

  // ================= TEAM MEMBERS =================

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedRateSheet?.teamStructures) return;

      const membersData: { [key: string]: TeamMember[] } = {};

      for (const structure of selectedRateSheet.teamStructures) {
        try {
          const response = await axiosInstance.get(
            `/employee/list/active/roleId?roleId=${structure.employeeRoleId}`,
          );

          membersData[structure._id] = response.data;
        } catch (error) {
          console.log(error);

          membersData[structure._id] = [];
        }
      }

      setTeamMembers(membersData);
    };

    fetchTeamMembers();
  }, [selectedRateSheet]);

  // ================= SUBMIT =================

  const onSubmit = (data: FormValues) => {
    console.log(data);

    alert("Product Created Successfully");
  };

  // ================= COMMON STYLE =================

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

  // ================= COMPONENT =================

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl">
      {/* ================= PAGE TITLE ================= */}

      <div className="mb-8">
        <p className="text-sm text-gray-500">Products &gt; Create</p>

        <h1 className="text-3xl font-bold mt-2">Add Product</h1>
      </div>

      <div className="max-w-180 mx-auto">
        {/* ================= FORM ================= */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* PRODUCT INFORMATION */}

          <div>
            <h2 className="text-xl font-semibold text-[#101828] mb-8">
              Product Information
            </h2>

            <div className="space-y-6">
              {/* COMPANY */}

              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Company <span className="text-[#F04438]">*</span>
                </label>

                <div>
                  <select
                    {...register("company")}
                    className={`${inputStyle} ${
                      errors.company ? errorInputStyle : ""
                    }`}
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
                    className={`${inputStyle} ${
                      errors.productName ? errorInputStyle : ""
                    }`}
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
                    className={`
                      w-full
                      border
                      rounded-md
                      px-4
                      py-3
                      text-[14px]
                      outline-none
                      resize-none
                      placeholder:text-[#98A2B3]
                      ${
                        errors.productDetails
                          ? errorInputStyle
                          : "border-[#E4E7EC]"
                      }
                    `}
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
            <h2 className="text-xl font-semibold text-[#101828] mb-8">
              Contract Information
            </h2>

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
                    className={`${inputStyle} ${
                      errors.contractName ? errorInputStyle : ""
                    }`}
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
                    className={`${inputStyle} ${
                      errors.status ? errorInputStyle : ""
                    }`}
                  >
                    <option value="">Select</option>

                    <option value="draft">Draft</option>

                    <option value="signed">Signed</option>
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
                      className={`${inputStyle} pl-11 ${
                        errors.startDate ? errorInputStyle : ""
                      }`}
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
                  <label className="text-[14px] text-right font-medium text-[#344054]">
                    End Date
                  </label>

                  <CircleAlert size={14} className="text-[#98A2B3]" />
                </div>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                  />

                  <input type="date" className={`${inputStyle} pl-11`} />
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* FINANCIAL TERMS */}
          {/* ================================================= */}

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
                    className={`${inputStyle} pr-32`}
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] text-[14px]">
                    % (Percentage)
                  </span>
                </div>
              </div>

              {/* RATE SHEET */}

              <div className="grid grid-cols-[180px_1fr] gap-6">
                <label className="text-[14px] text-right font-medium text-[#344054] pt-3">
                  Rate Sheet <span className="text-[#F04438]">*</span>
                </label>

                <div>
                  <select
                    {...register("rateSheet")}
                    className={`${inputStyle} ${
                      errors.rateSheet ? errorInputStyle : ""
                    }`}
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

          {/* ================================================= */}
          {/* RATE SHEET CONDITIONAL SECTION */}
          {/* ================================================= */}

          {selectedRateSheet && (
            <div className="border border-[#EAECF0] rounded-xl overflow-hidden">
              {/* HEADER */}

              <div className="px-6 py-5 border-b border-[#EAECF0] bg-[#FCFCFD] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-[#101828]">
                    {selectedRateSheet.name}
                  </h3>

                  <span className="text-[#667085] text-[14px]">
                    With {selectedRateSheet.teamStructures.length} roles
                  </span>
                </div>

                <button
                  type="button"
                  className="text-[#1570EF] text-[14px] font-medium"
                >
                  Save members
                </button>
              </div>

              {/* TEAM STRUCTURE */}

              {selectedRateSheet.teamStructures.map((item, index) => (
                <div
                  key={item._id}
                  className={`p-6 ${
                    index !== selectedRateSheet.teamStructures.length - 1
                      ? "border-b border-[#EAECF0]"
                      : ""
                  }`}
                >
                  {/* RATE */}

                  <div className="flex items-center gap-5 text-[13px] text-[#667085] mb-6">
                    <p>
                      Internal Rate: ${item.internalRate}
                      /month
                    </p>

                    <p>
                      Billing Rate: ${item.billRate}
                      /month
                    </p>
                  </div>

                  {/* MEMBER + WORK TYPE */}

                  <div className="grid grid-cols-2 gap-5">
                    {/* TEAM MEMBER */}

                    <div>
                      <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                        Team Member <span className="text-[#F04438]">*</span>
                      </label>

                      <select
                        {...register("teamMember")}
                        className={`${inputStyle} ${
                          errors.teamMember ? errorInputStyle : ""
                        }`}
                      >
                        <option value="">Select</option>

                        {teamMembers[item._id]?.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                      </select>

                      {errors.teamMember && (
                        <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                          <CircleAlert size={14} />
                          {errors.teamMember.message}
                        </p>
                      )}
                    </div>

                    {/* WORK TYPE */}

                    <div>
                      <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                        Work Type <span className="text-[#F04438]">*</span>
                      </label>

                      <select
                        {...register("workType")}
                        className={`${inputStyle} ${
                          errors.workType ? errorInputStyle : ""
                        }`}
                      >
                        <option value="">Select</option>

                        <option value="full-time">Full Time</option>

                        <option value="part-time">Part Time</option>
                      </select>

                      {errors.workType && (
                        <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                          <CircleAlert size={14} />
                          {errors.workType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* START + END DATE */}

                  <div className="grid grid-cols-2 gap-5 mt-5">
                    {/* START */}

                    <div>
                      <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                        Start Date <span className="text-[#F04438]">*</span>
                      </label>

                      <input
                        type="date"
                        {...register("memberStartDate")}
                        className={`${inputStyle} ${
                          errors.memberStartDate ? errorInputStyle : ""
                        }`}
                      />

                      {errors.memberStartDate && (
                        <p className="text-[#F04438] text-[13px] mt-1 flex items-center gap-1">
                          <CircleAlert size={14} />
                          {errors.memberStartDate.message}
                        </p>
                      )}
                    </div>

                    {/* END */}

                    <div>
                      <label className="block text-[14px] text-right font-medium text-[#344054] mb-2">
                        End Date
                      </label>

                      <input type="date" className={inputStyle} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================================================= */}
          {/* LEGAL DOCUMENTS */}
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
                <input
                  type="file"
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
                  "
                />

                <p className="text-[12px] text-[#667085] mt-2">
                  Any document file can be uploaded within 10MB.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <input type="checkbox" />

                  <label className="text-[14px] text-[#344054]">
                    Use link to share document
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* BUTTONS */}
          {/* ================================================= */}

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="
                cursor-pointer
                h-11
                px-6
                rounded-xl
                border
                border-[#D0D5DD]
                bg-white
                text-[#344054]
                font-medium
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
              cursor-pointer
                h-11
                px-6
                rounded-xl
                bg-[#1570EF]
                text-white
                font-medium
              "
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;
