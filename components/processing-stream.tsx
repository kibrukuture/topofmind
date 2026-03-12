"use client";

import {
  User,
  CheckCircle,
  Sparkle,
  Note,
  UserPlus,
} from "@phosphor-icons/react";
import type { ToolCallEntry } from "@/lib/agent-tool-call-log";

type ProcessingStreamProps = {
  toolCallLog: ToolCallEntry[];
  isProcessing: boolean;
};

type ToolLabelConfig = {
  icon: React.ComponentType<{ size?: number; className?: string; weight?: "bold" | "regular" }>;
  label: (entry: ToolCallEntry) => string;
};

const toolLabelConfig: Record<string, ToolLabelConfig> = {
  findPerson: {
    icon: User,
    label: (entry) =>
      entry.id ? `found: ${entry.name ?? "person"}` : "searching...",
  },
  createPerson: {
    icon: UserPlus,
    label: (entry) => `created: ${entry.name ?? "person"}`,
  },
  saveCommitment: {
    icon: CheckCircle,
    label: (entry) => `commitment: ${entry.action ?? "saved"}`,
  },
  savePersonalDetail: {
    icon: Sparkle,
    label: (entry) => `detail: ${entry.detail ?? "saved"}`,
  },
  saveExtractedContext: {
    icon: Note,
    label: () => "context saved",
  },
};

export function ProcessingStream({
  toolCallLog,
  isProcessing,
}: ProcessingStreamProps) {
  if (!isProcessing && toolCallLog.length === 0) return null;

  return (
    <div className="space-y-2 py-4">
      {isProcessing && toolCallLog.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          agent is reading your note...
        </div>
      )}
      {toolCallLog.map((entry, i) => {
        const config = toolLabelConfig[entry.tool];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in"
          >
            <Icon size={14} className="text-primary" weight="bold" />
            {config.label(entry)}
          </div>
        );
      })}
    </div>
  );
}
