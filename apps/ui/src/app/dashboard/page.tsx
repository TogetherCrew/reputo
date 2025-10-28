import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Algorithm } from "@/core/algorithms";
import { algorithms } from "@/core/algorithms";
import {
  Clock,
  Layers,
  LayoutGrid,
  List,
  Target,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// algorithms imported from shared file

const categories: {
  key: Algorithm["category"];
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "Core Engagement",
    title: "Core Engagement",
    description: "Fundamental algorithms for measuring user participation",
    icon: <Target className="size-4 text-primary" />,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-full">
                <Input
                  placeholder="Search algorithms by name, description, or tags..."
                  className="pl-9"
                />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                >
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
              </div>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="core">Core Engagement</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden sm:flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Grid view">
                  <LayoutGrid className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="List view">
                  <List className="size-4" />
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Selected algorithms"
                  >
                    <Layers className="size-4" />
                  </Button>
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-xs text-background">
                    2
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            1 algorithms found
          </div>

          <div className="flex flex-col gap-8">
            {categories.map((cat) => {
              const items = algorithms.filter((a) => a.category === cat.key);
              return (
                <section key={cat.key} className="flex flex-col gap-4">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">{cat.icon}</div>
                    <div>
                      <h2 className="text-lg font-semibold">{cat.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((algo) => (
                      <Link
                        key={algo.id}
                        href={`/dashboard/algorithms/${algo.id}`}
                      >
                        <Card key={algo.id} className="">
                          <CardHeader className="grid grid-cols-[1fr_auto] gap-2">
                            <div className="flex flex-col gap-2">
                              <Badge variant="outline" className="w-fit">
                                {algo.category}
                              </Badge>
                              <CardTitle className="text-base">
                                {algo.title}
                              </CardTitle>
                            </div>
                            <CardAction>
                              <Checkbox
                                aria-label="Select algorithm"
                                className="size-5 rounded-full"
                              />
                            </CardAction>
                          </CardHeader>

                          <CardContent className="-mt-3">
                            <CardDescription>
                              {algo.description}
                            </CardDescription>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
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
                          </CardContent>

                          <CardFooter>
                            Inputs:
                            <div className="flex flex-wrap gap-2 px-2">
                              {algo.inputs.map((t) => (
                                <Image
                                  width={24}
                                  height={24}
                                  key={t.type}
                                  src={`/icons/${t.type}.png`}
                                  alt={t.type}
                                />
                              ))}
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
