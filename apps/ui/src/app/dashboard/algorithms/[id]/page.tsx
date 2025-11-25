import { ArrowLeft, Clock, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlgorithmTabs } from "@/components/app/algorithm-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { algorithms, getAlgorithmById } from "@/core/algorithms";

type PageProps = { params: Promise<{ id: string }> };

export default async function AlgorithmPage({ params }: PageProps) {
  const { id } = await params;
  const algo = getAlgorithmById(id);
  if (!algo) {
    notFound();
  }
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 size-4" /> Back
          </Link>
        </Button>
        <Badge variant="outline">{algo.category}</Badge>
        {/* Version selector */}
        {/* <div className="ml-auto">
          <Select defaultValue="v1.0.0">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v1.0.0">v1.0.0</SelectItem>
              <SelectItem value="v1.1.0">v1.1.0</SelectItem>
              <SelectItem value="v1.2.0">v1.2.0</SelectItem>
              <SelectItem value="v1.0.0-rc.1">v1.0.0-rc.1</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      <section className="grid gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{algo.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{algo.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" /> {algo.duration}
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" /> {algo.dependencies}
            </span>
            <Badge className="bg-emerald-500 text-white border-transparent">
              {algo.level}
            </Badge>
          </div>
        </div>
      </section>

      <Suspense fallback={<div></div>}>
        <AlgorithmTabs algo={algo} />
      </Suspense>
    </>
  );
}

export async function generateStaticParams() {
  return algorithms.map((a) => ({ id: a.id }));
}
