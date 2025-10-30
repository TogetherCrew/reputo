"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import type { AlgorithmPresetResponseDto, UpdateAlgorithmPresetDto } from "@/lib/api/types";
import { ReputoForm } from "@/core/reputo-form";
import { buildSchemaFromAlgorithm } from "@/core/schema-builder";
import { getAlgorithmById } from "@/core/algorithms";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditPresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preset: AlgorithmPresetResponseDto | null;
  onUpdatePreset: (data: UpdateAlgorithmPresetDto) => Promise<void>;
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

export function EditPresetDialog({ 
  isOpen, 
  onClose, 
  preset, 
  onUpdatePreset, 
  isLoading,
  error: backendError,
}: EditPresetDialogProps) {
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  // Get algorithm from preset
  const algorithm = useMemo(() => {
    if (!preset) return null;
    return getAlgorithmById(preset.key);
  }, [preset]);

  // Generate schema from algorithm
  const schema = useMemo(() => {
    if (!algorithm) return null;
    return buildSchemaFromAlgorithm(algorithm, preset?.version || "1.0.0");
  }, [algorithm, preset]);

  // Build default values from preset
  const defaultValues = useMemo(() => {
    if (!preset || !algorithm) return {};

    const defaults: Record<string, unknown> = {
      key: preset.key,
      version: preset.version,
      name: preset.name || "",
      description: preset.description || "",
    };

    // Map preset inputs to form field values
    preset.inputs.forEach((presetInput) => {
      // Try to match preset input key to algorithm input label
      const algoInput = algorithm.inputs.find(
        (input) => input.label === presetInput.key || input.label.toLowerCase().replace(/\s+/g, "_") === presetInput.key.toLowerCase()
      );
      
      if (algoInput) {
        const inputKey = algoInput.label.toLowerCase().replace(/\s+/g, "_");
        // Convert string value to File-like object if it's a filename
        if (presetInput.value && typeof presetInput.value === "string") {
          // For CSV fields, we'll store the filename
          defaults[inputKey] = presetInput.value;
        } else {
          defaults[inputKey] = presetInput.value;
        }
      }
    });

    return defaults;
  }, [preset, algorithm]);

  // Parse backend errors
  const backendErrors = useMemo(() => {
    if (!backendError) return [];
    return parseBackendError(backendError);
  }, [backendError]);

  // Combine form errors and backend errors
  const allErrors = [...formErrors, ...backendErrors];

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!preset || !algorithm) return;

    setFormErrors([]);

    try {
      // Transform form data to UpdateAlgorithmPresetDto format
      // Key and version come from preset prop, not form data
      const updateData: UpdateAlgorithmPresetDto = {
        name: data.name as string | undefined,
        description: data.description as string | undefined,
        inputs: algorithm.inputs.map((input) => {
          const inputKey = input.label.toLowerCase().replace(/\s+/g, "_");
          const value = data[inputKey];
          
          // Convert File object to filename string
          let inputValue: unknown;
          if (value instanceof File) {
            inputValue = value.name;
          } else {
            inputValue = value || "";
          }

          return {
            key: input.label,
            value: inputValue,
          };
        }),
      };

      await onUpdatePreset(updateData);
      
      // Close dialog on success
      onClose();
    } catch (err) {
      // Don't close dialog on error - errors will be displayed
      const parsedErrors = parseBackendError(err);
      setFormErrors(parsedErrors);
    }
  };

  const handleClose = () => {
    setFormErrors([]);
    onClose();
  };

  if (!preset || !algorithm || !schema) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Preset</DialogTitle>
          <DialogDescription>
            Update your preset name, description, and input files for {algorithm.title}.
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
          submitLabel="Update Preset"
          defaultValues={defaultValues}
          hiddenFields={["key", "version"]}
          className="mt-4"
        />
      </DialogContent>
    </Dialog>
  );
}
