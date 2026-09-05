"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { COMMON_TEAMS, TEAM_ROLES, TeamRole, type Profile } from "@/lib/types";

export function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [role, setRole] = useState<TeamRole>(
    (TEAM_ROLES.includes(profile.role as TeamRole) ? profile.role : "Member") as TeamRole
  );
  const [team, setTeam] = useState(profile.team || "");
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url || "");
  const [skillsText, setSkillsText] = useState(profile.skills.join(", "));
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Image file size must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
      setMessage("");
    };
    reader.readAsDataURL(file);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    const data = Object.fromEntries(f);
    const skills = skillsText
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      full_name: String(data.full_name || "").trim(),
      role,
      team: team || null,
      photo_url: photoUrl || null,
      bio: String(data.bio || "").trim() || null,
      skills,
      github_url: String(data.github_url || "").trim() || null,
      linkedin_url: String(data.linkedin_url || "").trim() || null,
      instagram_url: String(data.instagram_url || "").trim() || null,
      website_url: String(data.website_url || "").trim() || null,
      status: data.status,
    };

    const r = await fetch(`/api/admin/profiles/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const b = await r.json();
    if (!r.ok) {
      setMessage(b.error || "Could not update profile.");
      setSaving(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function deleteProfile() {
    const confirmed = window.confirm(
      `Are you sure you want to delete profile "${profile.full_name}" (${profile.public_id})? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setMessage("");
    const r = await fetch(`/api/admin/profiles/${profile.id}`, {
      method: "DELETE",
    });
    const b = await r.json();
    if (!r.ok) {
      setMessage(b.error || "Could not delete profile.");
      setDeleting(false);
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
      <label>
        Full Name
        <input name="full_name" required defaultValue={profile.full_name} />
      </label>

      <label>
        Public ID (NFC Identifier)
        <input disabled value={profile.public_id} />
        <small>Public IDs stay fixed after NFC cards are issued. URL: /@{profile.public_id}</small>
      </label>

      {/* Profile Photo Upload */}
      <label className="wide">
        Profile Photo
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
          {photoUrl ? (
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--cyan)",
                flexShrink: 0,
              }}
            >
              <img
                src={photoUrl}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px dashed rgba(255,255,255,0.2)",
                display: "grid",
                placeItems: "center",
                color: "var(--muted)",
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              Photo
            </div>
          )}
          <div style={{ flex: 1, display: "grid", gap: "6px" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ fontSize: "13px" }}
            />
            {photoUrl && (
              <button
                type="button"
                className="button danger"
                style={{ width: "max-content", padding: "4px 10px", fontSize: "11px" }}
                onClick={() => setPhotoUrl("")}
              >
                Remove Photo
              </button>
            )}
            <small>Upload new JPG, PNG or WEBP (max 2MB)</small>
          </div>
        </div>
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
        <select name="status" defaultValue={profile.status === "disabled" ? "disabled" : "active"}>
          <option value="active">Active (Card is live)</option>
          <option value="disabled">Disabled (Card is hidden/inactive)</option>
        </select>
      </label>

      {/* Short Bio */}
      <label className="wide">
        Short Bio
        <textarea name="bio" rows={3} defaultValue={profile.bio || ""} />
      </label>

      {/* Skills */}
      <label className="wide">
        Skills
        <input
          name="skills"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          placeholder="Next.js, NFC, Creative Tech, Public Relations"
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
        <input name="github_url" type="url" defaultValue={profile.github_url || ""} placeholder="https://github.com/username" />
      </label>
      <label>
        LinkedIn
        <input name="linkedin_url" type="url" defaultValue={profile.linkedin_url || ""} placeholder="https://linkedin.com/in/username" />
      </label>
      <label>
        Instagram / X
        <input name="instagram_url" type="url" defaultValue={profile.instagram_url || ""} placeholder="https://instagram.com/... or https://x.com/..." />
      </label>
      <label>
        Personal Website
        <input name="website_url" type="url" defaultValue={profile.website_url || ""} placeholder="https://yourwebsite.com" />
      </label>

      {message && <p className="wide form-error">{message}</p>}

      <div className="wide form-actions" style={{ justifyContent: "space-between" }}>
        <button className="button primary" disabled={saving || deleting}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className="button danger"
          disabled={saving || deleting}
          onClick={deleteProfile}
        >
          {deleting ? "Deleting…" : "Delete profile"}
        </button>
      </div>
    </form>
  );
}
