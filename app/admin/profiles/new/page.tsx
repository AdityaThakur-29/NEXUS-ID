import Link from "next/link";
import { NewProfileForm } from "@/components/new-profile-form";

export default function NewProfilePage() {
  return <main className="shell admin"><nav className="nav"><Link href="/admin" className="brand">NEXUS / ID</Link><Link className="button" href="/admin">← Directory</Link></nav><div className="admin-top"><div><p className="eyebrow">Create participant</p><h1 style={{ fontSize: "46px", margin: 0 }}>New profile</h1></div></div><section className="side"><NewProfileForm /></section></main>;
}
