import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/app/dropzone";
import type { Algorithm } from "@/core/algorithms";
import { Clock, Users } from "lucide-react";

export function AlgorithmOverview({ algo }: { algo: Algorithm }) {
  return (
    <section className="grid gap-4">


      {algo.id === "voting-engagement" && (
        <div className="grid gap-3 rounded-lg border p-4">
          <h2 className="text-base font-semibold">I. Voting Engagement</h2>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              Voting entails significant effort and responsibility. It requires thoroughly reviewing proposals,
              carefully considering team capabilities, and evaluating community benefits. Unfortunately, some
              individuals opt for a simpler route, offering high ratings to a select few projects while
              disregarding the rest. This behavior raises concerns of bias or collusion. To discourage these
              extreme voting behaviors and mitigate their impact, we consider the voting entropy of each user.
            </p>
            <p>
              Votes are expressed as integers from 1 to 10 or as a &quot;skip&quot; option, yielding 11 potential choices per
              proposal. Hence, we can calculate the voting entropy of a user i as:
            </p>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
{`H_i = - \\sum_{j=0}^{10} P_i(x_j) \\log_2 P_i(x_j)`}
            </pre>
            <p>
              Here, H_i is the entropy of individual i&apos;s voting behavior, and P_i(x_j) is the probability of the
              user i using the option x_j to vote. x_0 denotes the &quot;skip&quot; option, and x_k represents rating a
              project by k where k ∈ {"{"}1..10{"}"}. Higher voting entropy indicates more unpredictable voting behavior,
              while lower entropy suggests extreme behavior.
            </p>
            <p>
              For example, consider a user who voted 10 on one project and skipped the other 38 proposals in a round.
              That distribution yields very low entropy (≈ 0.172), reflecting extreme behavior. In contrast, a user
              with a more balanced distribution across scores yields a higher entropy (≈ 2.689), reflecting more
              responsible voting.
            </p>
            <p>
              To standardize, we divide by the maximum possible entropy (uniform distribution across 11 choices):
            </p>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
{`H_max = \\log_2 11`}
            </pre>
            <p>
              The voting engagement for user i is then:
            </p>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
{`V_e(i) = H_i / H_max = \\frac{- \\sum_{j=0}^{10} P_i(x_j) \\log_2 P_i(x_j)}{\\log_2 11}`}
            </pre>
            <p>
              This metric penalizes extremal behavior and amplifies the voices of users who cast unbiased, responsible,
              and honest votes. It can be computed per round or aggregated across rounds to assess behavior over time.
            </p>
          </div>
        </div>
      )}

      
    </section>
  );
}


