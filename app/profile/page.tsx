import Link from "next/link";
import { getProfile, profileUrl } from "@/lib/profiles";
import { notFound } from "next/navigation";
import { Interactive3dCard } from "@/components/interactive-3d-card";

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
        <section className="profile-3d-container">
          <Interactive3dCard profile={profile} url={url} />
        </section>
      )}
    </main>
  );
}
