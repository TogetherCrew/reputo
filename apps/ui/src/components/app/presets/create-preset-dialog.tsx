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
import { Plus, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import type { Algorithm } from "@/core/algorithms";
import { ReputoForm } from "@/core/reputo-form";
import { buildSchemaFromAlgorithm } from "@/core/schema-builder";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CreateAlgorithmPresetDto } from "@/lib/api/types";

interface CreatePresetDialogProps {
  algo?: Algorithm;
  onCreatePreset: (data: CreateAlgorithmPresetDto) => Promise<void>;
  isLoading: boolean;
  error?: unknown;
}

interface BackendError {
  statusCode?: number;
  message?: {
    message?: string[];
    error?: string;
    statusCode?: number;
  } | string;
}

/**
 * Parse backend error response to extract field errors
 */
function parseBackendError(error: unknown): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  
  if (!error || typeof error !== "object") {
    return errors;
  }

  const backendError = error as BackendError;
  
  // Handle nested message structure
  if (backendError.message) {
    if (typeof backendError.message === "string") {
      errors.push({ field: "_general", message: backendError.message });
    } else if (typeof backendError.message === "object" && backendError.message.message) {
      const messageArray = Array.isArray(backendError.message.message)
        ? backendError.message.message
        : [backendError.message.message];
      
      messageArray.forEach((msg) => {
        if (typeof msg === "string") {
          // Try to extract field name from error message
          // Format: "fieldName must be..."
          const fieldMatch = msg.match(/^(\w+)\s+/);
          const field = fieldMatch ? fieldMatch[1] : "_general";
          errors.push({ field, message: msg });
        }
      });
    }
  }

  return errors;
}

export function CreatePresetDialog({ 
  algo, 
  onCreatePreset, 
  isLoading, 
  error 
}: CreatePresetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  // Generate schema from algorithm
  const schema = useMemo(() => {
    if (!algo) return null;
    return buildSchemaFromAlgorithm(algo, "1.0.0");
  }, [algo]);

  // Parse backend errors
  const backendErrors = useMemo(() => {
    if (!error) return [];
    return parseBackendError(error);
  }, [error]);

  // Combine form errors and backend errors
  const allErrors = [...formErrors, ...backendErrors];

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!algo) return;

    setFormErrors([]);

    try {
      // Transform form data to CreateAlgorithmPresetDto format
      const createData: CreateAlgorithmPresetDto = {
        key: (data.key as string) || algo.id,
        version: (data.version as string) || "1.0.0",
        name: data.name as string | undefined,
        description: data.description as string | undefined,
        inputs: algo.inputs.map((input) => {
          const inputKey = input.label.toLowerCase().replace(/\s+/g, "_");
          const value = data[inputKey];
          
          // Convert File object to filename string
          let inputValue: unknown;
          if (value instanceof File) {
            inputValue = value.name;
          } else {
            inputValue = value || `placeholder_${inputKey}.csv`;
          }

          return {
            key: input.label,
            value: inputValue,
          };
        }),
      };

      await onCreatePreset(createData);
      
      // Close dialog on success
      setIsOpen(false);
    } catch (err) {
      // Don't close dialog on error - errors will be displayed
      const parsedErrors = parseBackendError(err);
      setFormErrors(parsedErrors);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFormErrors([]);
    }
  };

  if (!algo || !schema) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" /> Create New Preset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Preset</DialogTitle>
          <DialogDescription>
            Name your preset and configure the required inputs for {algo.title}.
          </DialogDescription>
        </DialogHeader>

        {/* Display general errors */}
        {allErrors.filter((e) => e.field === "_general").length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {allErrors
                .filter((e) => e.field === "_general")
                .map((e) => (
                  <div key={e.message}>{e.message}</div>
                ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Dynamic form */}
        <ReputoForm
          schema={schema}
          onSubmit={handleSubmit}
          submitLabel="Create Preset"
          defaultValues={{
            key: algo.id,
            version: "1.0.0",
          }}
          hiddenFields={["key", "version"]}
          className="mt-4"
        />
      </DialogContent>
    </Dialog>
  );
}
