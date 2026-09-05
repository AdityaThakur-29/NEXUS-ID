import Link from "next/link";

export default function Home() {
  return <main className="shell"><nav className="nav"><Link className="brand" href="/">NEXUS / ID</Link><Link className="button" href="/admin" prefetch={false}>Admin</Link></nav><section className="hero"><div><p className="eyebrow">Tap. Scan. Connect.</p><h1>Your event,<br />in the future.</h1><p className="lead">Every NFC card opens a living digital identity—built for the people who make your event matter.</p><Link className="button primary" href="/@AD001">View demo card</Link></div></section></main>;
}
