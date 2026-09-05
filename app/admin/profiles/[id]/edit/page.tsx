import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/profiles";
import { EditProfileForm } from "@/components/edit-profile-form";
export default async function EditProfilePage({params}:{params:Promise<{id:string}>}){const{id}=await params;const profile=await getProfileById(id);if(!profile)notFound();return <main className="shell admin"><nav className="nav"><Link href="/admin" className="brand">NEXUS / ID</Link><Link className="button" href="/admin">← Directory</Link></nav><div className="admin-top"><div><p className="eyebrow">{profile.public_id}</p><h1 style={{fontSize:"46px",margin:0}}>Edit profile</h1></div></div><section className="side"><EditProfileForm profile={profile}/></section></main>}
