"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { DataEntryForm } from "./data-entry-form";

export function DataEntryDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Data Entry</DialogTitle>
          <DialogDescription>
            Select a category and fill in the details for the new property or branch.
          </DialogDescription>
        </DialogHeader>
        <DataEntryForm />
      </DialogContent>
    </Dialog>
  );
}
