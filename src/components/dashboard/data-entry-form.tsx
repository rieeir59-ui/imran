"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  category: z.enum(["commercial", "residential", "hotel", "bank"]),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  value: z.coerce.number().positive({ message: "Value must be a positive number." }),
  // category-specific fields
  occupancyRate: z.coerce.number().min(0).max(1).optional(),
  units: z.coerce.number().int().positive().optional(),
  starRating: z.coerce.number().int().min(1).max(5).optional(),
  rooms: z.coerce.number().int().positive().optional(),
  transactionVolume: z.coerce.number().int().positive().optional(),
  employees: z.coerce.number().int().positive().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function DataEntryForm() {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  const category = form.watch("category");

  function onSubmit(values: FormData) {
    console.log(values);
    toast({
      title: "Data Submitted!",
      description: "Your new data entry has been successfully logged.",
    });
    // Here you would typically send the data to your backend/database
    // For this demo, we'll just log it and show a success message.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a data category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="bank">Bank Branch</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {category && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Alpha Tower" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Metropolis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 15000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {category === "commercial" && (
              <FormField
                control={form.control}
                name="occupancyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupancy Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g. 0.95 for 95%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {category === "residential" && (
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Units</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {category === "hotel" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="starRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Star Rating</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Rooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {category === "bank" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transactionVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Transaction Volume</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 120000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <Button type="submit" className="w-full">Submit Data</Button>
          </>
        )}
      </form>
    </Form>
  );
}
