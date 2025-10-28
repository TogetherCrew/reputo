"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Dropzone, DropzoneEmptyState, DropzoneContent } from "../dropzone";
import type { Algorithm } from "@/core/algorithms";

interface CreatePresetDialogProps {
  algo?: Algorithm;
  onCreatePreset: (data: {
    name: string;
    description: string;
    selectedFiles: Record<string, string>;
  }) => void;
  isLoading: boolean;
}

export function CreatePresetDialog({ algo, onCreatePreset, isLoading }: CreatePresetDialogProps) {
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});

  const handleFileSelect = (inputKey: string, fileName: string) => {
    setSelectedFiles(prev => ({
      ...prev,
      [inputKey]: fileName
    }));
  };

  const handleCreatePreset = () => {
    if (!algo || !presetName.trim()) return;

    // Check if all required inputs have files selected
    const missingFiles = algo.inputs.filter(input => !selectedFiles[input.label]);
    if (missingFiles.length > 0) {
      alert(`Please select files for: ${missingFiles.map(input => input.label).join(', ')}`);
      return;
    }

    onCreatePreset({
      name: presetName.trim(),
      description: presetDescription.trim(),
      selectedFiles,
    });

    // Reset form
    setPresetName("");
    setPresetDescription("");
    setSelectedFiles({});
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPresetName("");
      setPresetDescription("");
      setSelectedFiles({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" /> Create New Preset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Preset</DialogTitle>
          <DialogDescription>
            Name your preset and review the required inputs for this algorithm.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="preset-name" className="text-sm font-medium">Preset name</label>
            <Input
              placeholder={`e.g. ${algo?.title ?? "Preset"} Q1 2024`}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="preset-description" className="text-sm font-medium">Description</label>
            <Textarea
              placeholder={`Describe this preset for ${algo?.title ?? "the algorithm"}...`}
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-6">
            {algo?.inputs.map((input) => (
              <div key={input.label} className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Image
                    width={24}
                    height={24}
                    src={`/icons/${input.type}.png`}
                    alt={input.type}
                  />
                  <div className="font-medium">{input.label}</div>
                </div>
                <div className="space-y-2">
                  <Dropzone
                    accept={{ "text/csv": [".csv"] }}
                    maxFiles={1}
                    className="justify-start"
                    src={selectedFiles[input.label] ? [{ name: selectedFiles[input.label] } as File] : []}
                    onDrop={(acceptedFiles) => {
                      if (acceptedFiles.length > 0) {
                        handleFileSelect(input.label, acceptedFiles[0].name);
                      }
                    }}
                  >
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                  {selectedFiles[input.label] && (
                    <div className="flex items-center gap-2 p-2 text-sm text-green-600 bg-green-50 rounded-md border">
                      <div className="flex-1">{selectedFiles[input.label]}</div>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:text-red-800 underline"
                        onClick={() => handleFileSelect(input.label, "")}
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
          <Button 
            onClick={handleCreatePreset}
            disabled={isLoading || !presetName.trim()}
          >
            {isLoading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Create Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
