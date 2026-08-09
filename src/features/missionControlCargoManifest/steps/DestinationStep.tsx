import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMccmStore, selectHasHazardousCargo } from "../store/mccmStore";
import { STATIONS, sectorsForStation } from "../stations";
import { destinationFormSchema, type DestinationFormValues } from "./destinationSchema";

const TAP_TRANSITION = { type: "spring", stiffness: 500, damping: 30 } as const;
const MotionLink = motion.create(Link);

export function DestinationStep() {
  const navigate = useNavigate();
  const destination = useMccmStore((state) => state.destination);
  const clearanceCode = useMccmStore((state) => state.clearanceCode);
  const hasHazardousCargo = useMccmStore(selectHasHazardousCargo);
  const setDestination = useMccmStore((state) => state.setDestination);
  const setClearanceCode = useMccmStore((state) => state.setClearanceCode);

  const schema = useMemo(() => destinationFormSchema(hasHazardousCargo), [hasHazardousCargo]);

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      station: destination?.station ?? "",
      sector: destination?.sector ?? "",
      clearanceCode: clearanceCode ?? "",
    },
  });

  const selectedStation = form.watch("station");
  const sectorOptions = sectorsForStation(selectedStation);

  const onSubmit = (values: DestinationFormValues) => {
    setDestination({ station: values.station, sector: values.sector });
    setClearanceCode(hasHazardousCargo ? (values.clearanceCode?.trim() ?? null) : null);
    navigate("/mccm/review");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-4 md:p-6 space-y-5">
          <FormField
            control={form.control}
            name="station"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Station</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.resetField("sector", { defaultValue: "" });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a station" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATIONS.map((option) => (
                      <SelectItem key={option.station} value={option.station}>
                        {option.station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedStation}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={selectedStation ? "Select a sector" : "Choose a station first"}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectorOptions.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence initial={false}>
            {hasHazardousCargo && (
              <motion.div
                key="clearance-code"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    This manifest contains hazardous cargo — a clearance code is required before
                    launch.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="clearanceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clearance Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. HAZMAT-7734" {...field} />
                      </FormControl>
                      <FormDescription>Issued by station security for hazmat transport.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-2">
          <MotionLink
            to="/mccm/cargo"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={TAP_TRANSITION}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to Cargo Manifest
          </MotionLink>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={TAP_TRANSITION}
            className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            Continue to Review →
          </motion.button>
        </div>
      </form>
    </Form>
  );
}
