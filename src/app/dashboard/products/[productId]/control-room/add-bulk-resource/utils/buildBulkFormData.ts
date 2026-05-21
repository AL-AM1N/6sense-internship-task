import { BulkFormValues } from "../bulk-schema";

export const buildBulkFormData = (
  data: BulkFormValues,
  productId: string
) => {
  const formData = new FormData();

  data.resources.forEach((item, index) => {
    // Validate required fields exist before appending
    if (
      !item.fileObject ||
      !item.resourceName ||
      !item.category ||
      !item.resourceType ||
      !item.tool ||
      !item.toolPurpose
    ) {
      return; // Skip incomplete resources
    }

    formData.append(`resources[${index}][file]`, item.fileObject);
    formData.append(`resources[${index}][name]`, item.resourceName);
    formData.append(`resources[${index}][categoryId]`, item.category);
    formData.append(`resources[${index}][typeId]`, item.resourceType);
    formData.append(`resources[${index}][toolId]`, item.tool);
    formData.append(`resources[${index}][toolPurpose]`, item.toolPurpose);
    formData.append(`resources[${index}][productId]`, productId);

    if (item.instruction?.trim()) {
      formData.append(`resources[${index}][instruction]`, item.instruction);
    }
  });

  return formData;
};