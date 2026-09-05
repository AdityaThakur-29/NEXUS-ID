import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { getProfile, profileUrl } from "@/lib/profiles";
import { notFound } from "next/navigation";

export default async function PublicProfile({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const publicId = id?.toUpperCase();
  if (!publicId) notFound();
  const profile = await getProfile(publicId);
  if (!profile) notFound();
  const unavailable = profile.status !== "active";
  const url = profileUrl(profile.public_id);
  const initials = profile.full_name
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("");

  return (
    <main className="profile-page shell">
      <nav className="nav">
        <Link href="/" className="brand">
          NEXUS / ID
        </Link>
        <span className="eyebrow">
          {unavailable ? "Unavailable" : "NFC Digital Identity"}
        </span>
      </nav>
      {unavailable ? (
        <section className="hero">
          <div>
            <p className="eyebrow">Card inactive</p>
            <h1>Profile unavailable.</h1>
            <p className="lead">
              This event identity has been disabled. Please contact the event
              team if you need help.
            </p>
          </div>
        </section>
      ) : (
        <section className="profile-wrap">
          <article className="card">
            <div className="card-top">
              <span className="id">
                {profile.organization ?? "Event Identity"}
              </span>
              <span className="verified">
                ● {profile.is_verified ? "Verified member" : "Member"}
              </span>
            </div>
            <div className="avatar">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.full_name} />
              ) : (
                initials
              )}
            </div>
            <p className="id">
              {profile.badge_tier} · {profile.public_id}
            </p>
            <h1>{profile.full_name}</h1>
            <p className="role">{profile.role}</p>
            <p className="muted">{profile.team}</p>
            {profile.bio && <p className="muted">{profile.bio}</p>}
            <div className="skills">
              {profile.skills.map((skill) => (
                <span className="chip" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <footer className="card-footer">
              <span>SCAN / TAP TO CONNECT</span>
              <span>NFC · 01</span>
            </footer>
          </article>
          <aside className="side">
            <p className="eyebrow">
              Connect with {profile.full_name.split(" ")[0]}
            </p>
            <h2>Digital ID</h2>
            <div className="links">
              {profile.linkedin_url && (
                <a
                  className="link"
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn ↗
                </a>
              )}
              {profile.github_url && (
                <a
                  className="link"
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub ↗
                </a>
              )}
              {profile.website_url && (
                <a
                  className="link"
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Website ↗
                </a>
              )}
              {profile.instagram_url && (
                <a
                  className="link"
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram ↗
                </a>
              )}
            </div>
            <div className="qr">
              <QRCodeSVG value={url} size={150} />
            </div>
            <p
              className="muted"
              style={{ textAlign: "center", fontSize: 13, margin: "16px 0 0" }}
            >
              Scan to open this ID
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
