"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw } from "lucide-react";

type SortDirection = "asc" | "desc" | null;

export interface CSVViewerProps {
  href: string;
  className?: string;
  hasHeader?: boolean;
  delimiter?: string;
  fillHeight?: boolean;
}

interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

function parseCSV(text: string, delimiter = ","): ParsedCSV {
  // Normalize newlines
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        // Escaped quote
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        current.push(field);
        field = "";
      } else if (ch === "\n") {
        current.push(field);
        rows.push(current);
        current = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  // Flush last field/row
  current.push(field);
  if (current.length > 1 || (current.length === 1 && current[0] !== "")) {
    rows.push(current);
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map((h) =>
    h.replace(/^\uFEFF/, "").replace(/\u00a0/g, " ").trim().replace(/^["']+|["']+$/g, "")
  );
  const dataRows = rows.slice(1);
  // Normalize each row to headers length
  const normalizedRows = dataRows.map((r) => {
    if (r.length === headers.length) return r;
    if (r.length < headers.length) return [...r, ...Array(headers.length - r.length).fill("")];
    return r.slice(0, headers.length);
  });
  return { headers, rows: normalizedRows };
}

function isNumeric(value: string): boolean {
  if (value == null) return false;
  const v = value.trim();
  if (v === "") return false;
  const n = Number(v);
  return Number.isFinite(n);
}

export function CSVViewer({ href, className, hasHeader = true, delimiter = ",", fillHeight = false }: CSVViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csv, setCsv] = useState<ParsedCSV>({ headers: [], rows: [] });
  const [query, setQuery] = useState("");
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(href, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch CSV (${res.status})`);
      }
      const text = await res.text();
      const parsed = parseCSV(text, delimiter);
      // If file has no header but hasHeader=false, synthesize headers
      let finalParsed = parsed;
      if (!hasHeader && parsed.rows.length > 0) {
        const colCount = Math.max(...parsed.rows.map((r) => r.length));
        finalParsed = {
          headers: Array.from({ length: colCount }, (_, idx) => `Column ${idx + 1}`),
          rows: parsed.rows,
        };
      }
      setCsv(finalParsed);
      setLastRefreshedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [href, delimiter, hasHeader]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    if (!query) return csv.rows;
    const q = query.toLowerCase();
    return csv.rows.filter((row) => row.some((cell) => cell?.toLowerCase?.().includes(q)));
  }, [csv.rows, query]);

  const sortedRows = useMemo(() => {
    if (sortCol == null || sortDir == null) return filteredRows;
    const colIndex = sortCol;
    const accessor = (row: string[]) => row[colIndex] ?? "";

    const numericSample = filteredRows.slice(0, 25).every((r) => isNumeric(accessor(r)));
    const sign = sortDir === "asc" ? 1 : -1;
    const withIndex = filteredRows.map((r, i) => ({ r, i }));

    withIndex.sort((a, b) => {
      const va = accessor(a.r);
      const vb = accessor(b.r);
      if (numericSample) {
        const na = Number(va);
        const nb = Number(vb);
        if (na < nb) return -1 * sign;
        if (na > nb) return 1 * sign;
      } else {
        const sa = (va || "").toString().toLowerCase();
        const sb = (vb || "").toString().toLowerCase();
        if (sa < sb) return -1 * sign;
        if (sa > sb) return 1 * sign;
      }
      return a.i - b.i; // stable
    });
    return withIndex.map((x) => x.r);
  }, [filteredRows, sortCol, sortDir]);

  const handleHeaderClick = (index: number) => {
    if (sortCol !== index) {
      setSortCol(index);
      setSortDir("asc");
    } else {
      // Cycle asc -> desc -> none
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortDir(null);
        setSortCol(null);
      } else setSortDir("asc");
    }
  };

  return (
    <div className={`${className ?? ""} ${fillHeight ? "h-full flex flex-col min-w-0" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-60"
        />
        <div className="text-xs text-muted-foreground">
          Showing {sortedRows.length} of {csv.rows.length} rows
          {lastRefreshedAt ? ` • Updated ${new Date(lastRefreshedAt).toLocaleTimeString()}` : ""}
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Spinner /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mb-2">
          Failed to load CSV: {error}
        </div>
      )}

      <div className={`border rounded-md overflow-hidden min-w-0 ${fillHeight ? "flex-1" : ""}`}>
        <div className={`${fillHeight ? "h-full" : "max-h-[60vh]"} overflow-auto min-w-0`}>
          <Table>
            <TableHeader>
              <TableRow>
                {csv.headers.map((h, idx) => {
                  const isActive = sortCol === idx && sortDir !== null;
                  const headerKey = h || `Column-${String.fromCharCode(65 + idx)}`;
                  return (
                    <TableHead
                      key={headerKey}
                      className="cursor-pointer select-none"
                      onClick={() => handleHeaderClick(idx)}
                      title="Click to sort"
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="whitespace-pre-wrap wrap-break-word">{h || `Column ${idx + 1}`}</span>
                        {isActive ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={csv.headers.length}>
                    <div className="flex items-center gap-2 py-10 justify-center text-muted-foreground">
                      <Spinner />
                      <span>Loading CSV…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={csv.headers.length}>
                    <div className="text-center py-10 text-muted-foreground">
                      No rows found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row) => {
                  const rowKey = row.join("|").slice(0, 100) || `empty-row-${Math.random()}`;
                  return (
                    <TableRow key={rowKey}>
                      {csv.headers.map((headerName) => {
                        const colIndex = csv.headers.indexOf(headerName);
                        const value = row[colIndex] ?? "";
                        const cellKey = `${headerName}-${value}`;
                        return (
                          <TableCell key={cellKey}>
                            <div className="min-w-0 whitespace-pre-wrap wrap-break-word">
                              {value}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {!loading && !error && csv.headers.length > 0 && (
              <TableCaption className="px-2 break-all">
                Source: <span className="font-mono break-all">{href}</span>
              </TableCaption>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}

export default CSVViewer;


