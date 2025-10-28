"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2, Loader2, AlertCircle, FolderOpen, Play } from "lucide-react";
import { useState } from "react";
import { useSnapshots, useAlgorithmPresets, useDeleteSnapshot } from "@/lib/api/hooks";
import type { SnapshotResponseDto, AlgorithmPresetResponseDto } from "@/lib/api/types";
import type { Algorithm } from "@/core/algorithms";
import { useSearchParams } from "next/navigation";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SnapshotDetailsDialog } from "./snapshot-details-dialog";
import { SnapshotDeleteDialog } from "./snapshot-delete-dialog";

export function AlgorithmSnapshots({ algo }: { algo?: Algorithm }) {
  const [selectedPreset, setSelectedPreset] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<string | null>(null);
  const [snapshotToView, setSnapshotToView] = useState<SnapshotResponseDto | null>(null);
  const searchParams = useSearchParams();
  
  // Get preset filter from URL params
  const presetFilter = searchParams.get("preset");
  
  // API hooks
  const { data: snapshotsData, isLoading, error } = useSnapshots({
    algorithmPreset: presetFilter || undefined,
    status: selectedStatus !== "all" ? selectedStatus as 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' : undefined,
    limit: 50,
    populate: "algorithmPreset",
  });

  // Fetch all presets for the dropdown
  const { data: presetsData } = useAlgorithmPresets({
    key: algo?.id,
    limit: 100, // Get more presets for the dropdown
  });

  const deleteSnapshotMutation = useDeleteSnapshot();

  const handleDeleteSnapshot = (snapshotId: string) => {
    setSnapshotToDelete(snapshotId);
    setIsDeleteDialogOpen(true);
  };

  const handleViewSnapshot = (snapshot: SnapshotResponseDto) => {
    setSnapshotToView(snapshot);
    setIsDetailsDialogOpen(true);
  };

  const confirmDeleteSnapshot = async () => {
    if (!snapshotToDelete) return;
    
    try {
      await deleteSnapshotMutation.mutateAsync(snapshotToDelete);
      setIsDeleteDialogOpen(false);
      setSnapshotToDelete(null);
    } catch (error) {
      console.error("Failed to delete snapshot:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="secondary" className="w-fit">
            Running
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-foreground text-background border-transparent">
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500 text-white border-transparent">
            Failed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Queued</Badge>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Select value={presetFilter || selectedPreset} onValueChange={(value) => {
          if (value === "all") {
            setSelectedPreset("all");
            // Clear URL filter
            const params = new URLSearchParams(searchParams.toString());
            params.delete("preset");
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
          } else {
            setSelectedPreset(value);
            // Set URL filter
            const params = new URLSearchParams(searchParams.toString());
            params.set("preset", value);
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
          }
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Presets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Presets</SelectItem>
            {presetsData?.results.map((preset) => (
              <SelectItem key={preset._id} value={preset._id}>
                {preset.name || `${preset.key} preset`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grow" />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="7d">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Last 7 days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Empty className="h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 className="size-6 animate-spin" />
            </EmptyMedia>
            <EmptyTitle>Loading Snapshots</EmptyTitle>
            <EmptyDescription>
              Please wait while we fetch your snapshot executions...
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : error ? (
        <Empty className="h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-6 text-red-500" />
            </EmptyMedia>
            <EmptyTitle>Failed to Load Snapshots</EmptyTitle>
            <EmptyDescription>
              There was an error loading your snapshots. Please try again.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : snapshotsData?.results.length === 0 ? (
        <Empty className="h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Play className="size-6" />
            </EmptyMedia>
            <EmptyTitle>No Snapshots Found</EmptyTitle>
            <EmptyDescription>
              No snapshot executions found. Create a preset and run it to see snapshots here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => window.history.back()}>
              <FolderOpen className="mr-2 size-4" />
              Go to Presets
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preset Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshotsData?.results.map((snapshot) => {
                // Handle both string ID and populated object cases
                let presetName = "Unknown Preset";
                if (typeof snapshot.algorithmPreset === 'string') {
                  presetName = `Preset ${snapshot.algorithmPreset.slice(-8)}`;
                } else if (snapshot.algorithmPreset && typeof snapshot.algorithmPreset === 'object') {
                  const preset = snapshot.algorithmPreset as AlgorithmPresetResponseDto;
                  presetName = preset.name || `Preset ${preset._id?.slice(-8) || 'Unknown'}`;
                }
                
                return (
                  <TableRow key={snapshot._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{presetName}</div>
                        <div className="text-muted-foreground text-xs">
                          {snapshot.outputs ? Object.keys(snapshot.outputs).length : 0} outputs
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(snapshot.status)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatTimeAgo(snapshot.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {snapshot.status === 'completed' || snapshot.status === 'failed' 
                        ? formatTimeAgo(snapshot.updatedAt)
                        : "—"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" aria-label="View" onClick={() => handleViewSnapshot(snapshot)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Delete" 
                        onClick={() => handleDeleteSnapshot(snapshot._id)}
                        disabled={deleteSnapshotMutation.isPending}
                      >
                        {deleteSnapshotMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="text-center text-sm text-muted-foreground">
            Monitor snapshot executions and download results
          </div>
        </div>
      )}

      {/* Dialogs */}
      <SnapshotDetailsDialog 
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        snapshot={snapshotToView}
      />
      
      <SnapshotDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSnapshotToDelete(null);
        }}
        onConfirm={confirmDeleteSnapshot}
        isLoading={deleteSnapshotMutation.isPending}
      />
    </div>
  );
}
