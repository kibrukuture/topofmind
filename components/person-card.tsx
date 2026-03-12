import Link from "next/link";
import { Buildings, Briefcase, ArrowRight } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Person } from "@/drizzle/schema";

type PersonCardProps = {
  person: Person;
  commitmentsCount?: number;
};

const avatarColors = [
  "bg-primary",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
];

export function PersonCard({ person, commitmentsCount }: PersonCardProps) {
  const colorIndex = person.name.charCodeAt(0) % avatarColors.length;
  const initial = person.name.charAt(0).toUpperCase();

  return (
    <Link href={`/people/${person.id}`}>
      <Card className="flex cursor-pointer items-center gap-4 rounded-2xl border-input p-4 transition-all hover:border-primary/50 group">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-sm text-primary-foreground",
            avatarColors[colorIndex]
          )}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-card-foreground">
            {person.name}
          </p>
          <div className="mt-0.5 flex items-center gap-3">
            {person.role && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase size={10} />
                {person.role}
              </span>
            )}
            {person.company && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Buildings size={10} />
                {person.company}
              </span>
            )}
          </div>
        </div>
        {commitmentsCount !== undefined && commitmentsCount > 0 ? (
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {commitmentsCount} open
          </Badge>
        ) : null}
        <ArrowRight
          size={16}
          className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
        />
      </Card>
    </Link>
  );
}
