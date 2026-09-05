"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { COMMON_TEAMS, TEAM_ROLES, TeamRole } from "@/lib/types";
import { PhotoEditor } from "@/components/photo-editor";

export function NewProfileForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [publicId, setPublicId] = useState("");
  const [role, setRole] = useState<TeamRole>("Member");
  const [team, setTeam] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function generateId(nameToUse?: string) {
    const target = (nameToUse ?? fullName).trim();
    let prefix = "NX";
    if (target) {
      const parts = target.split(/\s+/);
      prefix = parts.map((p) => p[0]).slice(0, 3).join("").toUpperCase();
    }
    const num = String(Math.floor(1 + Math.random() * 999)).padStart(3, "0");
    setPublicId(`${prefix}${num}`);
  }


  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form);
    const skills = skillsText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      full_name: fullName,
      public_id: publicId || String(data.public_id || ""),
      role,
      team: team || null,
      photo_url: photoUrl || null,
      bio: String(data.bio || "").trim() || null,
      skills,
      github_url: String(data.github_url || "").trim() || null,
      linkedin_url: String(data.linkedin_url || "").trim() || null,
      instagram_url: String(data.instagram_url || "").trim() || null,
      website_url: String(data.website_url || "").trim() || null,
      status: data.status || "active",
    };

    const result = await fetch("/api/admin/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await result.json();
    if (!result.ok) {
      setMessage(body.error || "Could not save profile.");
      setSaving(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const skillsList = skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <form className="profile-form" onSubmit={submit}>
      {/* Full Name */}
      <label>
        Full Name
        <input
          name="full_name"
          required
          placeholder="e.g. Priya Sharma"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (!publicId) generateId(e.target.value);
          }}
        />
      </label>

      {/* Public ID for NFC Card */}
      <label>
        Public ID (NFC Identifier)
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            name="public_id"
            required
            placeholder="e.g. PS002"
            value={publicId}
            onChange={(e) => setPublicId(e.target.value.toUpperCase())}
            pattern="[A-Za-z0-9_-]{3,20}"
          />
          <button
            type="button"
            className="button"
            style={{ whiteSpace: "nowrap", padding: "10px 12px", fontSize: "12px" }}
            onClick={() => generateId()}
            title="Auto-generate from name initials"
          >
            ⚡ Generate
          </button>
        </div>
        <small>NFC URL: /@{publicId || "ID"}</small>
      </label>

      {/* Profile Photo: URL + Crop/Pan/Zoom Editor */}
      <label className="wide">
        Profile Photo
        <PhotoEditor value={photoUrl} onChange={setPhotoUrl} />
      </label>


      {/* Role Dropdown */}
      <label>
        Role
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as TeamRole)}
        >
          {TEAM_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      {/* Department / Team Field */}
      <label>
        Department / Team {role === "Team Head" && <span style={{ color: "var(--cyan)" }}>* (Required for Head)</span>}
        <input
          name="team"
          list="team-options"
          required={role === "Team Head"}
          placeholder={role === "Team Head" ? "e.g. Technical Team, PR Team" : "e.g. Technical Team (optional)"}
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        <datalist id="team-options">
          {COMMON_TEAMS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <small>{role === "Team Head" ? "Specify which department/team this head leads" : "Choose or type a department"}</small>
      </label>

      {/* Profile Status */}
      <label>
        Profile Status
        <select name="status" defaultValue="active">
          <option value="active">Active (Card is live)</option>
          <option value="disabled">Disabled (Card is hidden/inactive)</option>
        </select>
      </label>

      {/* Short Bio */}
      <label className="wide">
        Short Bio
        <textarea
          name="bio"
          placeholder="A short introduction for the digital ID card."
          rows={3}
        />
      </label>

      {/* Skills */}
      <label className="wide">
        Skills
        <input
          name="skills"
          placeholder="Next.js, NFC, Creative Tech, Public Relations"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
        />
        <small>Separate skills with commas.</small>
        {skillsList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
            {skillsList.map((skill) => (
              <span className="chip" key={skill} style={{ fontSize: "11px", padding: "4px 8px" }}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </label>

      {/* Social Links */}
      <label>
        GitHub
        <input name="github_url" type="url" placeholder="https://github.com/username" />
      </label>
      <label>
        LinkedIn
        <input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/username" />
      </label>
      <label>
        Instagram / X
        <input name="instagram_url" type="url" placeholder="https://instagram.com/... or https://x.com/..." />
      </label>
      <label>
        Personal Website
        <input name="website_url" type="url" placeholder="https://yourwebsite.com" />
      </label>

      {message && <p className="wide form-error">{message}</p>}

      <div className="wide form-actions">
        <button className="button primary" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
