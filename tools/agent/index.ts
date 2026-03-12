import type { DATABASE_TYPES } from "@/configs/db";
import { findPersonTool } from "@/tools/agent/find-person.tool";
import { createPersonTool } from "@/tools/agent/create-person.tool";
import { saveCommitmentTool } from "@/tools/agent/save-commitment.tool";
import { savePersonalDetailTool } from "@/tools/agent/save-personal-detail.tool";
import { saveExtractedContextTool } from "@/tools/agent/save-extracted-context.tool";

type Db = DATABASE_TYPES;

export function agentTools(db: Db, noteId: string) {
  return {
    findPerson: findPersonTool(db, noteId),
    createPerson: createPersonTool(db, noteId),
    saveCommitment: saveCommitmentTool(db, noteId),
    savePersonalDetail: savePersonalDetailTool(db, noteId),
    saveExtractedContext: saveExtractedContextTool(db, noteId),
  };
}
