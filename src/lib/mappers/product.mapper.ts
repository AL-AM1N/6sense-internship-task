import { FormValues } from "@/app/dashboard/products/create/schema";

export const mapProductPayload = (data: FormValues) => {
  return {
    companyId: data.company,
    productName: data.productName,
    productDetails: data.productDetails,

    contractName: data.contractName,
    contractStatus: data.status,

    startDate: data.startDate
      ? new Date(data.startDate).toISOString()
      : "",

    endDate: data.endDate
      ? new Date(data.endDate).toISOString()
      : "",

    safeAgreementAmount: data.safeAgreementAmount ?? 0,
    valuationCapitalAmount: data.valuationCapitalAmount ?? 0,
    discount: data.discount ?? 0,

    rateSheetId: data.rateSheet,

    documentLink: "",
    documentKey: "",

    linksToShare:
      data.documentLinks?.filter(Boolean).map((d) => d.url) ?? [],

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
        startDate: emp.startDate
          ? new Date(emp.startDate).toISOString()
          : "",
        endDate: emp.endDate ? new Date(emp.endDate).toISOString() : "",
      })),
    },
  };
};