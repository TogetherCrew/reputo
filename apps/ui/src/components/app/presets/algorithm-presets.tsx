"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Algorithm } from "@/core/algorithms";
import {
  Eye,
  Play,
  Trash2,
  Loader2,
  FolderOpen,
  AlertCircle,
  Edit,
  BarChart3,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  useAlgorithmPresets,
  useCreateAlgorithmPreset,
  useDeleteAlgorithmPreset,
  useCreateSnapshot,
  useUpdateAlgorithmPreset,
} from "@/lib/api/hooks";
import type {
  CreateAlgorithmPresetDto,
  CreateSnapshotDto,
  AlgorithmPresetResponseDto,
} from "@/lib/api/types";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CreatePresetDialog } from "./create-preset-dialog";
import { EditPresetDialog } from "./edit-preset-dialog";
import { PresetDetailsDialog } from "./preset-details-dialog";
import { PresetDeleteDialog } from "./preset-delete-dialog";

export function AlgorithmPresets({ algo }: { algo?: Algorithm }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [presetToView, setPresetToView] =
    useState<AlgorithmPresetResponseDto | null>(null);
  const [presetToEdit, setPresetToEdit] =
    useState<AlgorithmPresetResponseDto | null>(null);

  // API hooks
  const {
    data: presetsData,
    isLoading,
    error,
  } = useAlgorithmPresets({
    key: algo?.id,
    limit: 50,
  });
  const createPresetMutation = useCreateAlgorithmPreset();
  const updatePresetMutation = useUpdateAlgorithmPreset();
  const deletePresetMutation = useDeleteAlgorithmPreset();
  const createSnapshotMutation = useCreateSnapshot();

  const handleCreatePreset = async (data: {
    name: string;
    description: string;
    selectedFiles: Record<string, string>;
  }) => {
    if (!algo) return;

    const createData: CreateAlgorithmPresetDto = {
      key: algo.id,
      version: "1.0.0",
      inputs: algo.inputs.map((input) => ({
        key: input.label,
        value:
          data.selectedFiles[input.label] ||
          `placeholder_${input.label.toLowerCase().replace(/\s+/g, "_")}.csv`,
      })),
      name: data.name,
      description: data.description || `Preset for ${algo.title}`,
    };

    try {
      await createPresetMutation.mutateAsync(createData);
    } catch (error) {
      console.error("Failed to create preset:", error);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    setPresetToDelete(presetId);
    setIsDeleteDialogOpen(true);
  };

  const handleViewPreset = (preset: AlgorithmPresetResponseDto) => {
    setPresetToView(preset);
    setIsDetailsDialogOpen(true);
  };

  const handleEditPreset = (preset: AlgorithmPresetResponseDto) => {
    setPresetToEdit(preset);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePreset = async (data: {
    name: string;
    description: string;
    selectedFiles: Record<string, string>;
  }) => {
    if (!presetToEdit) return;

    const updateData = {
      name: data.name,
      description: data.description,
      inputs: presetToEdit.inputs.map((input) => ({
        key: input.key,
        value: data.selectedFiles[input.key] || input.value,
      })),
    };

    try {
      await updatePresetMutation.mutateAsync({
        id: presetToEdit._id,
        data: updateData,
      });
    } catch (error) {
      console.error("Failed to update preset:", error);
    }
  };

  const confirmDeletePreset = async () => {
    if (!presetToDelete) return;

    try {
      await deletePresetMutation.mutateAsync(presetToDelete);
      setIsDeleteDialogOpen(false);
      setPresetToDelete(null);
    } catch (error) {
      console.error("Failed to delete preset:", error);
    }
  };

  const handleRunPreset = async (presetId: string) => {
    try {
      const snapshotData: CreateSnapshotDto = {
        algorithmPreset: presetId,
        outputs: {},
      };

      await createSnapshotMutation.mutateAsync(snapshotData);

      // Navigate to snapshots tab with the preset filter
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "snapshots");
      params.set("preset", presetId);
      router.push(`${pathname}?${params.toString()}`);
    } catch (error) {
      console.error("Failed to create snapshot:", error);
    }
  };

  const handleViewSnapshots = (presetId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "snapshots");
    params.set("preset", presetId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Presets</h2>
          <p className="text-sm text-muted-foreground">
            Manage algorithm workflows and condition dependencies
          </p>
        </div>
        <CreatePresetDialog
          algo={algo}
          onCreatePreset={handleCreatePreset}
          isLoading={createPresetMutation.isPending}
        />
      </div>

      {isLoading ? (
        <Empty className="h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 className="size-6 animate-spin" />
            </EmptyMedia>
            <EmptyTitle>Loading Presets</EmptyTitle>
            <EmptyDescription>
              Please wait while we fetch your algorithm presets...
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : error ? (
        <Empty className="h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-6 text-red-500" />
            </EmptyMedia>
            <EmptyTitle>Failed to Load Presets</EmptyTitle>
            <EmptyDescription>
              There was an error loading your presets. Please try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </EmptyContent>
        </Empty>
      ) : presetsData?.results.length === 0 ? (
        <Empty className="h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No Presets Found</EmptyTitle>
            <EmptyDescription>
              You haven't created any presets yet. Get started by creating your
              first preset.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent></EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preset</TableHead>
                <TableHead>Algorithm</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presetsData?.results.map((preset) => (
                <TableRow key={preset._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {preset.name || `${preset.key} preset`}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {preset.inputs.length} inputs
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{preset.key}</div>
                      <div className="text-muted-foreground text-xs">
                        {preset.description || `Algorithm preset`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {preset.version}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(preset.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Run"
                        onClick={() => handleRunPreset(preset._id)}
                        disabled={createSnapshotMutation.isPending}
                      >
                        {createSnapshotMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View"
                        onClick={() => handleViewPreset(preset)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View Snapshots"
                        onClick={() => handleViewSnapshots(preset._id)}
                      >
                        <BarChart3 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() => handleEditPreset(preset)}
                        disabled={updatePresetMutation.isPending}
                      >
                        {updatePresetMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Edit className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => handleDeletePreset(preset._id)}
                        disabled={deletePresetMutation.isPending}
                      >
                        {deletePresetMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-center text-sm text-muted-foreground">
            Manage algorithm workflows and condition dependencies
          </div>
        </div>
      )}

      {/* Dialogs */}
      <PresetDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        preset={presetToView}
      />

      <EditPresetDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setPresetToEdit(null);
        }}
        preset={presetToEdit}
        onUpdatePreset={handleUpdatePreset}
        isLoading={updatePresetMutation.isPending}
      />

      <PresetDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPresetToDelete(null);
        }}
        onConfirm={confirmDeletePreset}
        isLoading={deletePresetMutation.isPending}
      />
    </div>
  );
}
