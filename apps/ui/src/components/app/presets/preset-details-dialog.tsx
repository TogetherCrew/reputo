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
import type { AlgorithmPresetResponseDto } from "@/lib/api/types";
import { FileDisplay } from "../file-display";

interface PresetDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preset: AlgorithmPresetResponseDto | null;
}

/**
 * Check if a value looks like a storage key (file path)
 */
function isStorageKey(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  return value.includes("/") || value.startsWith("uploads/");
}

export function PresetDetailsDialog({ isOpen, onClose, preset }: PresetDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preset Details</DialogTitle>
          <DialogDescription>
            View detailed information about this algorithm preset
          </DialogDescription>
        </DialogHeader>
        {preset && (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-sm">{preset.name || `${preset.key} preset`}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm">{preset.description || 'No description provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Algorithm</h3>
                <p className="text-sm">{preset.key}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Version</h3>
                <p className="text-sm">{preset.version}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="text-sm">{new Date(preset.createdAt).toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="text-sm">{new Date(preset.updatedAt).toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Input Parameters</h3>
              <div className="space-y-2">
                {preset.inputs.map((input) => (
                  isStorageKey(input.value) ? (
                    <FileDisplay
                      key={input.key}
                      label={input.key}
                      storageKey={input.value}
                    />
                  ) : (
                    <div key={input.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{input.key}</div>
                        <div className="text-sm text-muted-foreground">
                          {String(input.value)}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
