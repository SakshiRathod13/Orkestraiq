"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      if (mode === "login") await login({ email, password });
      else await register({ name, email, password, ...(organizationName ? { organizationName } : {}) });
      router.push("/dashboard"); router.refresh();
    } catch { setError("Could not sign in. Check your details and ensure the API is running."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto flex min-h-screen max-w-md items-center px-6"><Card className="w-full"><CardHeader><CardTitle>{mode === "login" ? "Sign in to Orchestraiq" : "Create your organization"}</CardTitle></CardHeader><CardContent><form className="grid gap-4" onSubmit={submit}>{mode === "register" ? <><Input placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required /><Input placeholder="Organization name" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} /></> : null}<Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required /><Input type="password" placeholder="Password (10+ characters)" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={mode === "register" ? 10 : 1} />{error ? <p className="text-sm text-red-600">{error}</p> : null}<Button type="submit" disabled={busy}>{busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"}</Button></form><button className="mt-4 text-sm text-muted-foreground underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}</button></CardContent></Card></main>;
}
