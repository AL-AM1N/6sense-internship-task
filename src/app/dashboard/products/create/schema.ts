import { z } from "zod";

export const schema = z.object({
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
  // safeAgreementAmount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  // valuationCapitalAmount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  // discount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().optional()),
  safeAgreementAmount: z.number().optional(),
  valuationCapitalAmount: z.number().optional(),
  discount: z.number().optional(),

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
    }),
  ),

  // LEGAL DOCS
  useDocumentLinks: z.boolean().optional(),
  documentLinks: z
    .array(
      z.object({
        url: z.string().optional(),
      }),
    )
    .optional(),
});

export type FormValues = z.infer<typeof schema>;
