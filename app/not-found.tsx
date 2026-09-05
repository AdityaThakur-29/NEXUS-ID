import Link from "next/link";
export default function NotFound() { return <main className="shell hero"><div><p className="eyebrow">404 / Unknown ID</p><h1>Card not found.</h1><p className="lead">This NFC or QR link does not match an active event identity.</p><Link className="button primary" href="/">Return home</Link></div></main>; }
