"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RegistrationField, submitPublicRegistration, usePublicEvent } from "@/lib/api";

export function PublicRegistrationPage({ orgSlug, eventSlug }: { orgSlug: string; eventSlug: string }) {
  const event = usePublicEvent(orgSlug, eventSlug);
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = event.data?.registrationForm;

  async function onSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (!form) return;

    setIsSubmitting(true);
    setMessage(null);
    await submitPublicRegistration(orgSlug, eventSlug, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      source: values.source || "direct",
      responses: values
    });
    setValues({});
    setMessage("Registration received. You are on the attendee list.");
    setIsSubmitting(false);
  }

  if (event.isLoading) {
    return <main className="min-h-screen bg-background p-6"><div className="mx-auto h-40 max-w-2xl animate-pulse rounded-lg bg-muted" /></main>;
  }

  if (event.isError || !event.data || !form) {
    return <main className="min-h-screen bg-background p-6"><p>Registration form unavailable.</p></main>;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-2xl gap-6 px-6 py-10">
        <Link className="text-sm text-muted-foreground" href={`/public/events/${orgSlug}/${eventSlug}`}>
          Back to event page
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{form.description}</p>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              {form.fields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={values[field.key] ?? ""}
                  onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
                />
              ))}
              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function DynamicField({
  field,
  value,
  onChange
}: {
  field: RegistrationField;
  value: string;
  onChange: (value: string) => void;
}) {
  const common = {
    id: field.key,
    required: field.required,
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value)
  };

  return (
    <label className="grid gap-1.5 text-sm" htmlFor={field.key}>
      <span className="font-medium">{field.label}</span>
      {field.type === "textarea" ? <Textarea {...common} /> : null}
      {field.type === "select" ? (
        <select className="h-10 rounded-md border border-border bg-card px-3 text-sm" {...common}>
          <option value="">Select</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : null}
      {field.type !== "textarea" && field.type !== "select" ? (
        <Input type={field.type === "phone" ? "tel" : field.type} {...common} />
      ) : null}
    </label>
  );
}
