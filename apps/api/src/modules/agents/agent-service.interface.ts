import type { AgentName, AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";

export interface StructuredAgentService<TOutput extends Prisma.InputJsonValue = Prisma.InputJsonValue> {
  readonly name: AgentName;
  run(input: AgentRunInput): Promise<TOutput>;
}
