import Link from "next/link";
import { getProfiles, profileUrl } from "@/lib/profiles";

export default async function AdminPage() {
  const profiles = await getProfiles();
  return <main className="shell admin"><nav className="nav"><Link href="/" className="brand">NEXUS / ID</Link><span className="eyebrow">Admin workspace</span></nav><div className="admin-top"><div><p className="eyebrow">Participants</p><h1 style={{fontSize:"46px",margin:0}}>Identity directory</h1></div><Link className="button primary" href="/admin/profiles/new">+ New profile</Link></div><section className="side" style={{overflowX:"auto"}}><table className="table"><thead><tr><th>Name</th><th className="hide-mobile">Role</th><th>ID</th><th>Status</th><th>Card URL</th><th></th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id}><td><strong>{profile.full_name}</strong><br /><small className="muted">{profile.badge_tier}</small></td><td className="hide-mobile">{profile.role}</td><td><Link href={`/@${profile.public_id}`} className="id">{profile.public_id}</Link></td><td><span className={`status ${profile.status}`}>{profile.status}</span></td><td><code style={{fontSize:11}}>{profileUrl(profile.public_id)}</code></td><td><Link className="button" href={`/admin/profiles/${profile.id}/edit`}>Edit</Link></td></tr>)}</tbody></table></section></main>;
}
