"use client";

import { useState } from "react";
import { CSVViewerDialog } from "@/components/app/csv/csv-viewer-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { storageApi } from "@/lib/api/services";
import type { AlgorithmPresetResponseDto } from "@/lib/api/types";

interface PresetDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  preset: AlgorithmPresetResponseDto | null;
}

export function PresetDetailsDialog({ isOpen, onClose, preset }: PresetDetailsDialogProps) {
  const [csvViewerOpen, setCsvViewerOpen] = useState(false);
  const [csvHref, setCsvHref] = useState<string | null>(null);

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
                  <div key={input.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{input.key}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {typeof input.value === "string" && input.value && (input.value.includes("/") || input.value.startsWith("uploads/")) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const { url } = await storageApi.createDownload({ key: input.value as string });
                              window.open(url, "_blank", "noopener,noreferrer");
                            } catch (e) {
                              console.error(e);
                              alert("Failed to create download link");
                            }
                          }}
                        >
                          Download
                        </Button>
                      )}
                      {typeof input.value === "string" && input.value && input.value.toLowerCase().includes(".csv") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const val = input.value as string;
                              let url = val;
                              if (!/^https?:\/\//i.test(val)) {
                                const res = await storageApi.createDownload({ key: val });
                                url = res.url;
                              }
                              setCsvHref(url);
                              setCsvViewerOpen(true);
                            } catch (e) {
                              console.error(e);
                              alert("Unable to open CSV viewer");
                            }
                          }}
                        >
                          View
                        </Button>
                      )}
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
      <CSVViewerDialog
        isOpen={csvViewerOpen}
        onClose={() => setCsvViewerOpen(false)}
        href={csvHref}
        title="CSV Input Preview"
      />
    </Dialog>
  );
}
