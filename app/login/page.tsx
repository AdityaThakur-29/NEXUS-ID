"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [register, setRegister] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = register
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else if (register) setMessage("Account created. Confirm your email if Supabase asks, then sign in.");
    else { router.replace("/admin"); router.refresh(); }
    setBusy(false);
  }
  return <main className="shell admin"><nav className="nav"><Link href="/" className="brand">NEXUS / ID</Link></nav><section className="auth-card side"><p className="eyebrow">Restricted area</p><h1 style={{fontSize:"44px"}}>{register ? "Create admin account" : "Admin sign in"}</h1><p className="muted">Use your event admin account to manage NFC identity cards.</p><form className="auth-form" onSubmit={submit}><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{message && <p className="form-error">{message}</p>}<button className="button primary" disabled={busy}>{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button><button className="button" type="button" onClick={() => { setRegister(!register); setMessage(""); }}>{register ? "I already have an account" : "Create first admin account"}</button></form></section></main>;
}
