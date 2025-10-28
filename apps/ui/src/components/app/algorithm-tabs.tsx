"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlgorithmOverview } from "@/components/app/algorithm-overview";
import { AlgorithmPresets } from "@/components/app/presets/algorithm-presets";
import { AlgorithmSnapshots } from "@/components/app/snapshots/algorithm-snapshots";
import type { Algorithm } from "@/core/algorithms";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AlgorithmTabs({ algo }: { algo: Algorithm }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const selected = searchParams.get("tab") ?? "presets";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={selected} onValueChange={handleChange} className="mt-4">
      <TabsList>
        {/* <TabsTrigger value="overview">Overview</TabsTrigger> */}
        <TabsTrigger value="presets">Presets</TabsTrigger>
        <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <AlgorithmOverview algo={algo} />
      </TabsContent>
      <TabsContent value="presets" className="mt-6">
        <AlgorithmPresets algo={algo} />
      </TabsContent>
      <TabsContent value="snapshots" className="mt-6">
        <AlgorithmSnapshots algo={algo} />
      </TabsContent>
    </Tabs>
  );
}


