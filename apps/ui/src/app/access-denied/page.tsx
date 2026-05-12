import { ShieldAlert } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type AccessDeniedCta,
  resolveAccessDeniedCopy,
} from "@/lib/access-denied/copy"

export const metadata: Metadata = {
  title: "Access denied · Reputo",
}

export const dynamic = "force-dynamic"

interface AccessDeniedPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function CtaButton({ cta }: { cta: AccessDeniedCta }) {
  switch (cta.kind) {
    case "mailto":
      return (
        <Button asChild className="w-full" size="lg">
          <a href={`mailto:${cta.email}`}>{cta.label}</a>
        </Button>
      )
    case "link":
      return (
        <Button asChild className="w-full" size="lg">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )
    case "none":
      return (
        <Button asChild className="w-full" size="lg" variant="outline">
          <Link href="/login">Back to sign in</Link>
        </Button>
      )
  }
}

export default async function AccessDeniedPage({
  searchParams,
}: AccessDeniedPageProps) {
  const params = await searchParams
  const reason = firstValue(params.reason)
  const supportEmail = process.env.NEXT_PUBLIC_ACCESS_SUPPORT_EMAIL?.trim()

  const copy = resolveAccessDeniedCopy(reason, { supportEmail })
  const primaryGoesToLogin =
    (copy.cta.kind === "link" && copy.cta.href === "/login") ||
    copy.cta.kind === "none"

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="bg-muted text-muted-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <CtaButton cta={copy.cta} />
          {primaryGoesToLogin ? null : (
            <Button asChild className="w-full" size="lg" variant="ghost">
              <Link href="/login">Back to sign in</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
