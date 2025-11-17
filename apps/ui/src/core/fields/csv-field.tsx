"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/app/dropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { CSVInput } from "../types";
import { validateCSVContent } from "../validation";

interface CSVFieldProps {
  input: CSVInput;
  control: Control<FieldValues>;
}

export function CSVField({ input, control }: CSVFieldProps) {
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = async (file: File | null, onChange: (file: File | null) => void) => {
    onChange(file);
    
    if (!file) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCSVContent(file, input.csv);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`],
      });
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
                  onUploadKey={(key) => {
                    onChange(key);
                  }}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
              
              {isValidating && (
                <div className="text-sm text-muted-foreground">
                  Validating CSV content...
                </div>
              )}
              
              {validationResult && !isValidating && (
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
            
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

