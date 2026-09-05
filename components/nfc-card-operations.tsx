"use client";

import React, { useState, useRef, useEffect } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/types";

interface NfcCardOperationsModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export function NfcCardOperationsModal({
  profile,
  isOpen,
  onClose,
}: NfcCardOperationsModalProps) {
  const [copied, setCopied] = useState(false);
  const [urlTested, setUrlTested] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [cardUrl, setCardUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCardUrl(`${window.location.origin}/@${profile.public_id}`);
    }
  }, [profile.public_id]);

  if (!isOpen) return null;

  const isActive = profile.status === "active";
  const allChecksPassed = urlTested && qrVerified && isActive;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = cardUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  function handleDownloadPng() {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector("canvas");
    if (!canvas) return;

    // Create a high-res canvas with padding and clean white background
    const exportCanvas = document.createElement("canvas");
    const padding = 32;
    exportCanvas.width = canvas.width + padding * 2;
    exportCanvas.height = canvas.height + padding * 2;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, padding, padding);

    const pngUrl = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `${profile.public_id}-nfc-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDownloadSvg() {
    if (!canvasRef.current) return;
    const svg = canvasRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const a = document.createElement("a");
    a.href = svgUrl;
    a.download = `${profile.public_id}-nfc-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(svgUrl);
  }

  function handleTestUrl() {
    setUrlTested(true);
    window.open(cardUrl, "_blank", "noopener,noreferrer");
  }

  function handleVerifyQr() {
    setQrVerified(true);
  }

  return (
    <div className="nfc-modal-overlay" onClick={onClose}>
      <div className="nfc-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="nfc-modal-header">
          <div>
            <span className="eyebrow">Phase 3 · NFC Card Issuing</span>
            <h2 className="nfc-modal-title">
              Issue Card: {profile.full_name} ({profile.public_id})
            </h2>
          </div>
          <button className="nfc-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="nfc-modal-body">
          {/* Section 1: NFC Tag Encoding */}
          <div className="nfc-card-box">
            <div className="nfc-box-head">
              <h3>1. NFC Tag URL</h3>
              <span className="nfc-box-sub">Encode this canonical URL onto the physical NFC card</span>
            </div>
            <div className="nfc-url-row">
              <input
                type="text"
                readOnly
                value={cardUrl}
                className="nfc-url-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className={`button ${copied ? "primary" : ""}`}
                onClick={handleCopy}
              >
                {copied ? "✓ Copied!" : "Copy NFC URL"}
              </button>
            </div>
          </div>

          {/* Section 2: QR Code Generation & Download */}
          <div className="nfc-card-box">
            <div className="nfc-box-head">
              <h3>2. Badge QR Image</h3>
              <span className="nfc-box-sub">Download high-res QR code for badge sticker or print</span>
            </div>
            <div className="nfc-qr-row">
              <div className="nfc-qr-display" ref={canvasRef}>
                <QRCodeCanvas
                  value={cardUrl || "https://example.com"}
                  size={140}
                  level="H"
                  marginSize={1}
                />
                <div style={{ display: "none" }}>
                  <QRCodeSVG
                    value={cardUrl || "https://example.com"}
                    size={200}
                    level="H"
                    marginSize={1}
                  />
                </div>
              </div>
              <div className="nfc-qr-actions">
                <button
                  type="button"
                  className="button primary"
                  onClick={handleDownloadPng}
                >
                  ↓ Download QR image (PNG)
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={handleDownloadSvg}
                >
                  ↓ Download Vector (SVG)
                </button>
                <small className="muted">
                  300 DPI ready for badge lamination & card printers.
                </small>
              </div>
            </div>
          </div>

          {/* Section 3: Test Checklist */}
          <div className="nfc-card-box checklist-box">
            <div className="nfc-box-head">
              <h3>3. Card Issuing Test Checklist</h3>
              <span className="nfc-box-sub">
                Verify each requirement before handing the physical badge to the participant
              </span>
            </div>
            <ul className="nfc-checklist">
              <li className={`checklist-item ${urlTested ? "passed" : "pending"}`}>
                <div className="checklist-icon">{urlTested ? "✓" : "○"}</div>
                <div className="checklist-text">
                  <strong>URL opens</strong>
                  <span className="muted">
                    {urlTested
                      ? "NFC target URL verified and opened in browser"
                      : "Click 'Test URL' to confirm the link renders properly"}
                  </span>
                </div>
                <button
                  type="button"
                  className="button"
                  onClick={handleTestUrl}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {urlTested ? "Re-test URL ↗" : "Test URL ↗"}
                </button>
              </li>

              <li className={`checklist-item ${qrVerified ? "passed" : "pending"}`}>
                <div className="checklist-icon">{qrVerified ? "✓" : "○"}</div>
                <div className="checklist-text">
                  <strong>QR scans</strong>
                  <span className="muted">
                    {qrVerified
                      ? `QR code encodes valid canonical path (/@${profile.public_id})`
                      : "Confirm QR scanner successfully reads and directs to ID"}
                  </span>
                </div>
                <button
                  type="button"
                  className="button"
                  onClick={handleVerifyQr}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  {qrVerified ? "Verified ✓" : "Verify QR"}
                </button>
              </li>

              <li className={`checklist-item ${isActive ? "passed" : "failed"}`}>
                <div className="checklist-icon">{isActive ? "✓" : "✕"}</div>
                <div className="checklist-text">
                  <strong>Profile is active</strong>
                  <span className="muted">
                    {isActive
                      ? "Profile status is 'active'. Attendee card will display normally."
                      : "Profile is disabled! Unauthorized card tap will show unavailable."}
                  </span>
                </div>
                <span className={`status ${profile.status}`}>
                  {profile.status}
                </span>
              </li>
            </ul>

            {/* Workflow Result Banner */}
            <div className={`nfc-result-banner ${allChecksPassed ? "ready" : "waiting"}`}>
              <span className="result-badge">
                {allChecksPassed ? "✓ READY TO ISSUE" : "CHECKLIST IN PROGRESS"}
              </span>
              <p>
                {allChecksPassed
                  ? `All checks passed! The physical card for ${profile.full_name} (${profile.public_id}) is ready to be issued.`
                  : "Complete all tests above to finalize card issuing."}
              </p>
            </div>
          </div>
        </div>

        <div className="nfc-modal-footer">
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
          {allChecksPassed && (
            <button
              type="button"
              className="button primary"
              onClick={() => {
                alert(`Card for ${profile.full_name} (${profile.public_id}) marked ready & issued!`);
                onClose();
              }}
            >
              ✓ Complete Card Issuing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CopyNfcUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      className="nfc-copy-icon-btn"
      onClick={copy}
      title="Copy NFC URL"
    >
      {copied ? "✓ Copied" : "Copy URL"}
    </button>
  );
}
