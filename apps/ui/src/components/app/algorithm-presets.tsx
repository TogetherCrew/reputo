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
import type { Algorithm } from "@/core/algorithms";
import { Eye, Play, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./dropzone";

export function AlgorithmPresets({ algo }: { algo?: Algorithm }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openSnapshots = (presetName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "snapshots");
    params.set("preset", presetName);
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
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 size-4" /> Create New Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Preset</DialogTitle>
              <DialogDescription>
                Name your preset and review the required inputs for this
                algorithm.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="preset-name" className="text-sm font-medium">Preset name</label>
                <Input
                  placeholder={`e.g. ${algo?.title ?? "Preset"} Q1 2024`}
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
                    <Dropzone
                      accept={{ "text/csv": [".csv"] }}
                      maxFiles={1}
                      className="justify-start"
                    >
                      <DropzoneEmptyState />
                      <DropzoneContent />
                    </Dropzone>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button>Create Preset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xl">
          <Input
            placeholder="Search presets, descriptions, or categories..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="modified">
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Last Modified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modified">Last Modified</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Preset</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Snapshots</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              {
                name: "DeepFunding Q1 2024",
                desc: "Comprehensive reputation scoring workflow for Q1 funding round",
                workflow: { conditions: 5, outputs: 5 },
                version: "v1.0.0",
                categories: ["Data Collection", "Analysis"],
                status: "Active",
                runtime: "Instant",
                modified: "2 hours ago by Moe",
              },
              {
                name: "Community Engagement Pipeline",
                desc: "Multi-platform engagement analysis with dependency mapping",
                workflow: { conditions: 7, outputs: 7 },
                version: "v1.1.0",
                categories: ["Data Collection", "Analysis"],
                status: "Active",
                runtime: "Instant",
                modified: "1 day ago by Behzad",
              },

              {
                name: "Proposal Voting Weight Calculator",
                desc: "Token-weighted voting power calculation with historical analysis",
                workflow: { conditions: 4, outputs: 4 },
                version: "v0.9.0",
                categories: ["Data Collection", "Analysis"],
                status: "Draft",
                runtime: "Instant",
                modified: "3 days ago by Moe",
              },
              {
                name: "Community Engagement Pipeline Q2 2024",
                desc: "Multi-platform engagement analysis with dependency mapping",
                workflow: { conditions: 7, outputs: 7 },
                version: "v1.2.0",
                categories: ["Data Collection", "Analysis"],
                status: "Active",
                runtime: "Instant",
                modified: "1 day ago by Behzad",
              },
              {
                name: "Proposal Voting Weight Calculator Q2 2024",
                desc: "Token-weighted voting power calculation with historical analysis",
                workflow: { conditions: 4, outputs: 4 },
                version: "v1.0.0-rc.1",
                categories: ["Data Collection", "Analysis"],
                status: "Draft",
                runtime: "Instant",
                modified: "3 days ago by Moe",
              },
            ].map((row, idx) => (
              <TableRow key={row.name} className="align-top">
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {row.desc}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm">
                    {row.workflow.conditions} inputs
                  </div>
                  <div className="text-sm">{row.workflow.outputs} outputs</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{row.version}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSnapshots(row.name)}
                  >
                    View Snapshots
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" aria-label="Run">
                      <Play className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="View">
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
