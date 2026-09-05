"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function NewProfileForm() {
  const router = useRouter(); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(""); const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form); const skills = String(data.skills || "").split(",").map((v) => v.trim()).filter(Boolean);
    const result = await fetch("/api/admin/profiles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, skills }) });
    const body = await result.json(); if (!result.ok) { setMessage(body.error || "Could not save profile."); setSaving(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <form className="profile-form" onSubmit={submit}><label>Full name<input name="full_name" required placeholder="e.g. Priya Sharma" /></label><label>Public ID<input name="public_id" required placeholder="e.g. PS002" pattern="[A-Za-z0-9_-]{3,20}" /><small>NFC URL: /@PS002</small></label><label>Role / designation<input name="role" required placeholder="e.g. Design Team" /></label><label>Organization<input name="organization" placeholder="e.g. Nexus Event 2026" /></label><label>Team<input name="team" placeholder="e.g. Experience Lab" /></label><label>Badge tier<select name="badge_tier" defaultValue="Participant"><option>Participant</option><option>Organizer</option><option>Speaker</option><option>Volunteer</option><option>Guest</option></select></label><label className="wide">Short bio<textarea name="bio" placeholder="A short introduction for the digital ID card." rows={4} /></label><label className="wide">Skills<input name="skills" placeholder="Next.js, Design, NFC" /><small>Separate skills with commas.</small></label><label>LinkedIn URL<input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." /></label><label>GitHub URL<input name="github_url" type="url" placeholder="https://github.com/..." /></label><label>Website URL<input name="website_url" type="url" placeholder="https://..." /></label><label>Instagram URL<input name="instagram_url" type="url" placeholder="https://instagram.com/..." /></label>{message && <p className="wide form-error">{message}</p>}<div className="wide form-actions"><button className="button primary" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button></div></form>;
}
