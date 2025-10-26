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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { algorithms } from "@/core/algorithms";
import { Download, Eye, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

type Snapshot = {
  id: string;
  algorithmId: string;
  name: string;
  status: "Completed" | "Running" | "Pending" | "Failed";
  progress?: number;
  startedAgo: string;
  duration?: string;
  records: number;
};

const sample: Snapshot[] = [
  {
    id: "SN-2024-001",
    algorithmId: "voting-engagement",
    name: "DeepFunding Q1 2024",
    status: "Completed",
    startedAgo: "2 days ago",
    duration: "45 min 23 sec",
    records: 2547,
  },
  {
    id: "SN-2024-002",
    algorithmId: "contribution-score",
    name: "Community Engagement Pipeline",
    status: "Running",
    progress: 67,
    startedAgo: "1 hour ago",
    duration: "28 min 12 sec",
    records: 1832,
  },
  {
    id: "SN-2024-010",
    algorithmId: "voting-engagement",
    name: "DeepFunding Q1 2024",
    status: "Completed",
    startedAgo: "2 days ago",
    duration: "45 min 23 sec",
    records: 2547,
  },
  {
    id: "SN-2024-011",
    algorithmId: "voting-engagement",
    name: "DeepFunding Q1 2024",
    status: "Completed",
    startedAgo: "2 days ago",
    duration: "45 min 23 sec",
    records: 2547,
  },
  {
    id: "SN-2024-003",
    algorithmId: "token-time-weighting",
    name: "Proposal Voting Weight Calculator",
    status: "Pending",
    startedAgo: "20 min ago",
    records: 0,
  },
  {
    id: "SN-2024-012",
    algorithmId: "contribution-score",
    name: "Community Engagement Pipeline",
    status: "Running",
    progress: 67,
    startedAgo: "1 hour ago",
    duration: "28 min 12 sec",
    records: 1832,
  },
  {
    id: "SN-2024-004",
    algorithmId: "voting-engagement",
    name: "DeepFunding Q1 2024",
    status: "Failed",
    startedAgo: "3 hours ago",
    duration: "12 min 45 sec",
    records: 0,
  },
];

export function AlgorithmSnapshots() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Presets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Presets</SelectItem>
            {algorithms.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
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
        <div className="grow" />
        <div className="flex place-self-end items-center gap-3 text-sm text-muted-foreground">
          <span>Auto-refresh</span>
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 size-4" /> Refresh
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Preset Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sample.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono">{s.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {s.records.toLocaleString()} records
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {s.status === "Running" ? (
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit">
                      Running
                    </Badge>
                    <div className="h-1.5 w-40 rounded bg-muted">
                      <div
                        className="h-full rounded bg-foreground"
                        style={{ width: `${s.progress ?? 0}%` }}
                      />
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {s.progress ?? 0}%
                    </div>
                  </div>
                ) : s.status === "Completed" ? (
                  <Badge className="bg-foreground text-background border-transparent">
                    Completed
                  </Badge>
                ) : s.status === "Failed" ? (
                  <Badge className="bg-red-500 text-white border-transparent">
                    Failed
                  </Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {s.startedAgo}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {s.duration ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" aria-label="View">
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Download">
                    <Download className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Delete">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>
          Monitor snapshot executions and download results
        </TableCaption>
      </Table>
    </div>
  );
}
