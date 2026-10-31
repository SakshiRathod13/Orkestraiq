import { z } from "zod";
import type { AiJsonRequest, AiJsonResponse, AiProvider } from "./index.js";

export class OpenAiCompatibleProvider implements AiProvider {
  readonly name = "openai-compatible";

  constructor(
    private readonly config: { apiKey: string; baseUrl: string; model: string }
  ) {}

  async generateJson<TInput, TOutput>(
    request: AiJsonRequest<TInput>,
    schema: z.ZodType<TOutput>
  ): Promise<AiJsonResponse<TOutput>> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${request.promptVersion.systemPrompt}\nReturn only one JSON object. Do not use markdown.` },
          { role: "user", content: JSON.stringify(request.input) }
        ]
      })
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
    const body = (await response.json()) as { id?: string; choices?: Array<{ message?: { content?: string } }> };
    const rawText = body.choices?.[0]?.message?.content;
    if (!rawText) throw new Error("AI provider returned no message content.");
    let parsed: unknown;
    try { parsed = JSON.parse(rawText); } catch { throw new Error("AI provider returned invalid JSON."); }
    return body.id
      ? { output: schema.parse(parsed), rawText, providerRequestId: body.id }
      : { output: schema.parse(parsed), rawText };
  }
}
