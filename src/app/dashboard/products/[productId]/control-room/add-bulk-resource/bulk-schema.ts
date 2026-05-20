import * as z from "zod";

// ================= ZOD SCHEMA =================
export const singleResourceSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  fileObject: z.any(),
  resourceName: z.string().min(1, "Resource name is required"),
  category: z.string().min(1, "Category is required"),
  resourceType: z.string().min(1, "Resource type is required"),
  tool: z.string().min(1, "Tool parameter is required"),
  toolPurpose: z.string().min(1, "tool purpose is required").max(250, "Keep under 250 characters"),
  instruction: z.string().max(250, "Keep under 250 characters").optional().or(z.literal("")),
});

export const bulkResourceFormSchema = z.object({
  resources: z.array(singleResourceSchema).min(1, "Please upload at least one valid resource"),
});

export type BulkFormValues = z.infer<typeof bulkResourceFormSchema>;