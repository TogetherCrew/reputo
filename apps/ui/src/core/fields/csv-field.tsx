"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/app/dropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { storageApi } from "@/lib/api/services";
import type { CSVInput } from "../types";
import { validateCSVContent } from "../validation";

interface CSVFieldProps {
  input: CSVInput;
  control: Control<FieldValues>;
}

export function CSVField({ input, control }: CSVFieldProps) {
  const { setError, clearErrors } = useFormContext<FieldValues>();
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (file: File | null, onChange: (value: File | string | null) => void) => {
    // Clear previous validation state
    setValidationResult(null);
    setIsUploading(false);
    clearErrors(input.key);
    
    if (!file) {
      onChange(null);
      return;
    }

    // Set file value first for UI feedback
    onChange(file);

    setIsValidating(true);
    try {
      const result = await validateCSVContent(file, input.csv);
      setValidationResult(result);
      
      if (result.valid) {
        // Clear any previous errors
        clearErrors(input.key);
        // Upload file after validation passes
        setIsUploading(true);
        try {
          const contentType = file.type || 'text/csv';
          const { key, url } = await storageApi.createUpload({
            filename: file.name,
            contentType,
          });
          const putResponse = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': contentType },
            body: file,
          });
          if (putResponse.status < 200 || putResponse.status >= 300) {
            throw new Error(`Upload failed with status ${putResponse.status}`);
          }
          // Set the storage key as the field value
          onChange(key);
        } catch (uploadError) {
          const errorMessage = `Upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`;
          setValidationResult({
            valid: false,
            errors: [errorMessage],
          });
          setError(input.key, {
            type: "manual",
            message: errorMessage,
          });
          onChange(null);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Set form error to prevent submission
        const errorMessage = result.errors.join("; ");
        setError(input.key, {
          type: "manual",
          message: errorMessage,
        });
        // Clear the file value so form won't submit with invalid file
        onChange(null);
      }
    } catch (error) {
      const errorMessage = `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      setValidationResult({
        valid: false,
        errors: [errorMessage],
      });
      setError(input.key, {
        type: "manual",
        message: errorMessage,
      });
      onChange(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <FormField
      control={control}
      name={input.key}
      render={({ field: { value, onChange } }) => {
        // Handle both File objects and string filenames (from backend)
        const fileValue = value instanceof File ? value : null;
        const filenameValue = typeof value === "string" ? value : null;
        
        return (
          <FormItem>
            <FormLabel>
              {input.label}
              {input.required !== false && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                {/* Show filename if it's a string (from backend) */}
                {filenameValue && (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground bg-muted rounded-md border">
                    <div className="flex-1">{filenameValue}</div>
                    <span className="text-xs text-muted-foreground">(Upload new file to replace)</span>
                  </div>
                )}
                
                <Dropzone
                  accept={{ "text/csv": [".csv"] }}
                  maxFiles={1}
                  src={fileValue ? [fileValue] : undefined}
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles?.[0] || null;
                    handleFileChange(file, onChange);
                  }}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
              
              {isValidating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  <span>Validating CSV content...</span>
                </div>
              )}
              
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  <span>Uploading file...</span>
                </div>
              )}
              
              {validationResult && !isValidating && !isUploading && (
                <Alert variant={validationResult.valid ? "default" : "destructive"}>
                  <div className="flex items-start gap-2">
                    {validationResult.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <div className="space-y-1 flex-1">
                      <AlertDescription>
                        {validationResult.valid ? (
                          <span className="text-green-600 dark:text-green-400 whitespace-nowrap">
                            CSV structure is valid
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-semibold">Validation Errors:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {validationResult.errors.map((error) => (
                                <li key={error} className="text-sm whitespace-nowrap">{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
              </div>
            </FormControl>
            
            {input.description && (
              <FormDescription>{input.description}</FormDescription>
            )}
            
            {input.csv.columns.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Expected Columns:</div>
                <div className="flex flex-wrap gap-2">
                  {input.csv.columns.map((column) => (
                    <Badge key={column.key} variant="secondary" className="text-xs">
                      {column.key}
                      {column.aliases && column.aliases.length > 0 && (
                        <span className="text-muted-foreground ml-1">
                          (or {column.aliases.join(", ")})
                        </span>
                      )}
                      {column.required !== false && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
          </FormItem>
        );
      }}
    />
  );
}

