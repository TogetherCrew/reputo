"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  BooleanField,
  CSVField,
  DateField,
  EnumField,
  NumberField,
  SliderField,
  TextField,
} from "./fields";
import { FormUploadProvider, useFormUpload } from "./form-context";
import type { Input, ReputoSchema } from "./types";
import { buildZodSchema } from "./validation";

interface ReputoFormProps {
  schema: ReputoSchema;
  onSubmit: (data: any) => void | Promise<void>;
  defaultValues?: Record<string, any>;
  submitLabel?: string;
  clientValidate?: boolean;
  showResetButton?: boolean;
  className?: string;
  hiddenFields?: string[]; // Field keys to hide from UI but keep in validation
}

export function ReputoForm(props: ReputoFormProps) {
  return (
    <FormUploadProvider>
      <ReputoFormInner {...props} />
    </FormUploadProvider>
  );
}

function ReputoFormInner({
  schema,
  onSubmit,
  defaultValues = {},
  submitLabel = "Submit",
  clientValidate = true,
  showResetButton = false,
  className = "",
  hiddenFields = [],
}: ReputoFormProps) {
  // Build Zod schema from ReputoSchema
  const zodSchema = clientValidate ? buildZodSchema(schema) : null;

  // Initialize form with react-hook-form
  const form = useForm({
    resolver: clientValidate && zodSchema ? zodResolver(zodSchema) : undefined,
    defaultValues: getDefaultValues(schema, defaultValues),
    mode: "onChange", // Validate on change for real-time validity
    reValidateMode: "onChange",
  });

  // Get upload state from context
  const { isUploading } = useFormUpload();

  // Watch all values to trigger re-validation
  const watchedValues = useWatch({ control: form.control });

  // Render appropriate field component based on input type
  const renderField = (input: Input) => {
    const commonProps = {
      input: input as any,
      control: form.control,
    };

    switch (input.type) {
      case "text":
        return <TextField key={input.key} {...commonProps} />;
      case "number":
        return <NumberField key={input.key} {...commonProps} />;
      case "boolean":
        return <BooleanField key={input.key} {...commonProps} />;
      case "enum":
        return <EnumField key={input.key} {...commonProps} />;
      case "slider":
        return <SliderField key={input.key} {...commonProps} />;
      case "csv":
        return <CSVField key={input.key} {...commonProps} />;
      case "date":
        return <DateField key={input.key} {...commonProps} />;
      default:
        return null;
    }
  };

  // Filter out hidden fields from rendering
  const visibleInputs = schema.inputs.filter(
    (input) => !hiddenFields.includes(input.key)
  );

  // Check if all required fields have values
  const hasAllRequiredValues = schema.inputs
    .filter((input) => input.required !== false)
    .every((input) => {
      const value = watchedValues?.[input.key];
      if (value === undefined || value === null || value === "") {
        return false;
      }
      // For CSV fields, make sure it's a string (uploaded key) not a File object
      if (input.type === "csv" && value instanceof File) {
        return false; // Still uploading or validating
      }
      return true;
    });

  // Determine if submit should be disabled
  const isSubmitDisabled = 
    form.formState.isSubmitting || 
    isUploading || 
    !form.formState.isValid ||
    !hasAllRequiredValues ||
    Object.keys(form.formState.errors).length > 0;

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {visibleInputs.map((input) => renderField(input))}
          
          <div className="flex justify-end gap-2 pt-4">
            {showResetButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
            )}
            <Button type="submit" disabled={isSubmitDisabled}>
              {form.formState.isSubmitting 
                ? "Submitting..." 
                : isUploading 
                  ? "Uploading..." 
                  : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

/**
 * Gets default values for form fields based on schema
 */
function getDefaultValues(
  schema: ReputoSchema,
  userDefaults: Record<string, any>
): Record<string, any> {
  const defaults: Record<string, any> = {};

  schema.inputs.forEach((input) => {
    if (userDefaults[input.key] !== undefined) {
      defaults[input.key] = userDefaults[input.key];
    } else {
      // Set type-appropriate defaults
      switch (input.type) {
        case "boolean":
          defaults[input.key] = false;
          break;
        case "number":
          defaults[input.key] = input.min ?? 0;
          break;
        case "slider":
          defaults[input.key] = input.min;
          break;
        case "text":
        case "enum":
        case "date":
        case "csv":
          if (input.required === false) {
            defaults[input.key] = undefined;
          } else {
            defaults[input.key] = "";
          }
          break;
      }
    }
  });

  return defaults;
}
