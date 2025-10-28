"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Dropzone, DropzoneEmptyState, DropzoneContent } from "../dropzone";
import type { AlgorithmPresetResponseDto } from "@/lib/api/types";

interface EditPresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preset: AlgorithmPresetResponseDto | null;
  onUpdatePreset: (data: {
    name: string;
    description: string;
    selectedFiles: Record<string, string>;
  }) => void;
  isLoading: boolean;
}

export function EditPresetDialog({ 
  isOpen, 
  onClose, 
  preset, 
  onUpdatePreset, 
  isLoading 
}: EditPresetDialogProps) {
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});

  // Initialize form fields when preset changes
  useEffect(() => {
    if (preset) {
      setPresetName(preset.name || "");
      setPresetDescription(preset.description || "");
      
      // Initialize selectedFiles with current input values
      const files: Record<string, string> = {};
      preset.inputs.forEach(input => {
        if (input.value && typeof input.value === 'string') {
          files[input.key] = input.value;
        }
      });
      setSelectedFiles(files);
    }
  }, [preset]);

  const handleFileSelect = (inputKey: string, fileName: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [inputKey]: fileName
    }));
  };

  const handleUpdatePreset = () => {
    if (!preset || !presetName.trim()) return;

    onUpdatePreset({
      name: presetName.trim(),
      description: presetDescription.trim(),
      selectedFiles,
    });

    // Reset form
    setPresetName("");
    setPresetDescription("");
    setSelectedFiles({});
    onClose();
  };

  const handleClose = () => {
    setPresetName("");
    setPresetDescription("");
    setSelectedFiles({});
    onClose();
  };

  if (!preset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Preset</DialogTitle>
          <DialogDescription>
            Update your preset name, description, and input files.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="preset-name" className="text-sm font-medium">Preset name</label>
            <Input
              placeholder={`e.g. ${preset.key} Q1 2024`}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="preset-description" className="text-sm font-medium">Description</label>
            <Textarea
              placeholder={`Describe this preset for ${preset.key}...`}
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-6">
            {preset.inputs.map((input) => (
              <div key={input.key} className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    width={24}
                    height={24}
                    src={`/icons/csv.png`}
                    alt="csv"
                  />
                  <div className="font-medium">{input.key}</div>
                </div>
                <div className="space-y-2">
                  <Dropzone
                    accept={{ "text/csv": [".csv"] }}
                    maxFiles={1}
                    className="justify-start"
                    src={selectedFiles[input.key] ? [{ name: selectedFiles[input.key] } as File] : []}
                    onDrop={(acceptedFiles) => {
                      if (acceptedFiles.length > 0) {
                        handleFileSelect(input.key, acceptedFiles[0].name);
                      }
                    }}
                  >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                  {selectedFiles[input.key] && (
                    <div className="flex items-center gap-2 p-2 text-sm text-green-600 bg-green-50 rounded-md border">
                      <div className="flex-1">{selectedFiles[input.key]}</div>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:text-red-800 underline"
                        onClick={() => handleFileSelect(input.key, "")}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePreset}
            disabled={isLoading || !presetName.trim()}
          >
            {isLoading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Update Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

