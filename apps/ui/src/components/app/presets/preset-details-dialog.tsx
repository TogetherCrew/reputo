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

interface PresetDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preset: AlgorithmPresetResponseDto | null;
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
                <p className="text-sm">{new Date(preset.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="text-sm">{new Date(preset.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Input Parameters</h3>
              <div className="space-y-2">
                {preset.inputs.map((input) => (
                  <div key={input.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{input.key}</div>
                      <div className="text-sm text-muted-foreground">
                        Value: {String(input.value) || 'Not set'}
                      </div>
                    </div>
                  </div>
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
