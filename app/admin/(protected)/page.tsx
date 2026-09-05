import Link from "next/link";
import { getProfiles } from "@/lib/profiles";
import { CTable6 } from "@/components/c-table-6";

export default async function AdminPage() {
  const profiles = await getProfiles();
  return (
    <main className="shell admin">
      <nav className="nav">
        <Link href="/" className="brand">
          NEXUS / ID
        </Link>
        <span className="eyebrow">Admin workspace</span>
      </nav>
      <div className="admin-top">
        <div>
          <p className="eyebrow">Participants</p>
          <h1 style={{ fontSize: "46px", margin: 0 }}>Identity directory</h1>
        </div>
        <Link className="button primary" href="/admin/profiles/new">
          + New profile
        </Link>
      </div>
      <section className="admin-table-section">
        <CTable6 profiles={profiles} />
      </section>
    </main>
  );
}
