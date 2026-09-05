export function profileUrl(publicId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/@${publicId}`;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/@${publicId}`;
}
