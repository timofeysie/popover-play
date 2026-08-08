import { z } from "zod";

export function destinationFormSchema(hasHazardousCargo: boolean) {
  return z
    .object({
      station: z.string().min(1, "Select a station"),
      sector: z.string().min(1, "Select a sector"),
      clearanceCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (hasHazardousCargo && !data.clearanceCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["clearanceCode"],
          message: "Clearance code is required for hazardous cargo",
        });
      }
    });
}

export type DestinationFormValues = z.infer<ReturnType<typeof destinationFormSchema>>;
