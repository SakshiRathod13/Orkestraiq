"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createEventFromPrompt } from "@/lib/api";

interface PromptForm {
  prompt: string;
}

const samplePrompt =
  "Plan a 2 hour online AI portfolio workshop for final-year engineering students on 20 July at 6 PM. Keep the tone friendly, use English, make it free, target 120 attendees, and help students build one recruiter-ready AI project.";

export function CreateEventPromptPage({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PromptForm>({ defaultValues: { prompt: samplePrompt } });
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: PromptForm) {
    setError(null);
    try {
      const event = await createEventFromPrompt(orgId, values.prompt);
      router.push(`/organizations/${orgId}/events/${event.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create event brief.");
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Event creation</p>
        <h1 className="mt-1 text-2xl font-semibold">Describe the event once</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpsPilot prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Textarea
              {...form.register("prompt", { required: true, minLength: 20 })}
              aria-label="Event prompt"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" disabled={isSubmitting}>
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? "Extracting brief..." : "Generate event brief"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
