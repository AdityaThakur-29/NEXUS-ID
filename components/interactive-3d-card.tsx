"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/types";

interface Interactive3dCardProps {
  profile: Profile;
  url: string;
}

function getHindiName(fullName: string): string {
  const map: Record<string, string> = {
    "aditya thakur": "आदित्य ठाकुर",
    "aditya": "आदित्य",
    "om dubay": "ओम दुबे",
    "om dubey": "ओम दुबे",
    "om": "ओम",
  };
  const key = fullName.trim().toLowerCase();
  return map[key] || "सदस्य · नेक्सस";
}

export function Interactive3dCard({ profile, url }: Interactive3dCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const isAnimating = useRef(false);

  const hindiName = getHindiName(profile.full_name);

  function handleFlip() {
    if (isAnimating.current || !cardRef.current) return;
    isAnimating.current = true;

    if (!isFlipped) {
      // Rotate 0° -> 280° -> 180° (Show back)
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFlipped(true);
          isAnimating.current = false;
        },
      });

      tl.to(cardRef.current, {
        rotateY: 280,
        duration: 0.55,
        ease: "power2.inOut",
      }).to(cardRef.current, {
        rotateY: 180,
        duration: 0.45,
        ease: "back.out(1.6)",
      });
    } else {
      // Rotate back 180° -> -100° -> 0° (Show front)
      const tl = gsap.timeline({
        onComplete: () => {
          setIsFlipped(false);
          isAnimating.current = false;
        },
      });

      tl.to(cardRef.current, {
        rotateY: -100,
        duration: 0.55,
        ease: "power2.inOut",
      }).to(cardRef.current, {
        rotateY: 0,
        duration: 0.45,
        ease: "back.out(1.6)",
      });
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isAnimating.current || !containerRef.current || !cardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 6;
    const tiltY = (x / (rect.width / 2)) * 6;

    gsap.to(cardRef.current, {
      rotateX: tiltX,
      duration: 0.25,
      ease: "power1.out",
    });
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  }

  const tier = (profile.badge_tier || "MEMBER").toUpperCase();
  const publicId = profile.public_id || "OD794";
  const role = (profile.role || "MEMBER").toUpperCase();
  const team = (profile.team || "TECHNICAL TEAM").toUpperCase();

  return (
    <div className="card-system-container">
      {/* Interactive Controls Bar */}
      <div className="card-top-controls">
        <div
          className="flip-prompt-pill"
          onClick={handleFlip}
          role="button"
          tabIndex={0}
        >
          <span className="pill-arrow">⇄</span>
          <span>{isFlipped ? "Tap card to flip front" : "Tap card to flip back (280° → 180°)"}</span>
        </div>

        <div className="mode-toggle-group">
          <button
            type="button"
            className={`mode-btn ${!isTemplateMode ? "active" : ""}`}
            onClick={() => setIsTemplateMode(false)}
          >
            ✦ Identity View
          </button>
          <button
            type="button"
            className={`mode-btn ${isTemplateMode ? "active" : ""}`}
            onClick={() => setIsTemplateMode(true)}
          >
            ☵ Blank Template
          </button>
        </div>
      </div>

      {/* 3D Scene */}
      <div
        className="card-3d-stage"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="card-3d-box"
          ref={cardRef}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label="3D Indian Indie-Punk Profile Card. Tap to flip."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleFlip();
            }
          }}
        >
          {/* ===================================================================
              FRONT CARD FACE (480 x 764 Native Geometry)
             =================================================================== */}
          <div className="card-plane card-front-plane">
            {/* 1. Base Indian Screenprint Texture */}
            <div className="card-plane-bg card-front-texture" />

            {/* 2. Populated Content Layer */}
            {!isTemplateMode && (
              <div className="card-precise-overlay">
                {/* Top Header */}
                <div className="slot-top-brand">
                  <h2 className="slot-nexus-title">
                    NEXUS ID <span className="slot-plus">+</span>
                  </h2>
                  <p className="slot-sanskrit">॥ कर्मण्येवाधिकारस्ते ॥</p>
                </div>

                {/* Top Right Metadata */}
                <div className="slot-top-meta">
                  <span className="slot-bharat">भारत</span>
                  <span className="slot-verified">
                    <span className="slot-red-dot">●</span> VERIFIED MEMBER
                  </span>
                  <span className="slot-team-nexus">TEAM NEXUS</span>
                </div>

                {/* Left Ribbon ID Code */}
                <div className="slot-left-ribbon">
                  <span className="slot-ribbon-text">ID CODE</span>
                  <span className="slot-ribbon-id">{publicId}</span>
                </div>
                <div className="slot-left-motto">
                  <span>COLLABORATE • CREATE • ELEVATE</span>
                </div>

                {/* Avatar Photo (Exact fit inside concentric ring: 186x186) */}
                <div className="slot-avatar-circle">
                  <img
                    src={profile.photo_url || "/assets/aditya-photo.jpg"}
                    alt={profile.full_name}
                    className="slot-avatar-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/aditya-photo.jpg";
                    }}
                  />
                </div>

                {/* Right Stencil Badge */}
                <div className="slot-right-stencil">
                  <span className="slot-stencil-icon">॥ ☨ ॥</span>
                  <span className="slot-stencil-vtext">
                    STAY CURIOUS<br />BUILD IMPACT
                  </span>
                </div>

                {/* Notch Tag (Exact fit inside printed notch) */}
                <div className="slot-notch-tag">
                  <span className="slot-tag-tier">{tier}</span>
                  <span className="slot-tag-bullet">•</span>
                  <span className="slot-tag-id">{publicId}</span>
                </div>

                {/* Name Box (Exact fit inside printed name container) */}
                <div className="slot-name-box">
                  <div className="slot-name-text-col">
                    <h1 className="slot-hero-name">{profile.full_name}</h1>
                    <p className="slot-hindi-name">{hindiName}</p>
                  </div>
                  <div className="slot-mandala-wrap">
                    <svg viewBox="0 0 36 36" fill="none" className="slot-mandala-svg">
                      <circle cx="18" cy="18" r="16" stroke="#d4cbb8" strokeWidth="1" strokeDasharray="2 3" />
                      <circle cx="18" cy="18" r="9" stroke="#b3381e" strokeWidth="1" />
                      <path d="M18 2 L18 34 M2 18 L34 18 M6.7 6.7 L29.3 29.3 M6.7 29.3 L29.3 6.7" stroke="#d4cbb8" strokeWidth="0.8" />
                      <circle cx="18" cy="18" r="3" fill="#df744a" />
                    </svg>
                  </div>
                </div>

                {/* Role and Team Section */}
                <div className="slot-role-row">
                  <span className="slot-role-text">{role}</span>
                  <span className="slot-role-close-bracket">]</span>
                </div>
                <div className="slot-team-row">
                  <span className="slot-team-text">{team}</span>
                </div>

                {/* Bio Description */}
                {profile.bio && (
                  <div className="slot-bio-box">
                    <p className="slot-bio-text">{profile.bio}</p>
                  </div>
                )}

                {/* Tiger Stamp Patch (Exact fit on torn paper graphic) */}
                <div className="slot-tiger-patch">
                  <img
                    src="/assets/tiger-stamp.png"
                    alt="Soch Alag Kaam Damdar"
                    className="slot-tiger-img"
                  />
                </div>

                {/* Bottom 4-Cell Social Bar */}
                <div className="slot-bottom-quad-grid" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={profile.github_url || "https://github.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-quad-cell"
                    title="GitHub"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="slot-cell-icon">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </a>
                  <a
                    href={profile.linkedin_url || "https://linkedin.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-quad-cell"
                    title="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="slot-cell-icon">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a
                    href={profile.instagram_url || "https://x.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-quad-cell"
                    title="X / Social"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="slot-cell-icon">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href={profile.website_url || url}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-quad-cell"
                    title="Website / NFC URL"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="slot-cell-icon">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                    </svg>
                  </a>
                </div>

                {/* Front Footer */}
                <div className="slot-front-footer">
                  <span className="slot-footer-code">NFC • 01 +</span>
                  <span className="slot-footer-hint">SCAN / TAP TO CONNECT</span>
                  <span className="slot-footer-namaste">नमस्ते</span>
                </div>
              </div>
            )}
          </div>

          {/* ===================================================================
              BACK CARD FACE (480 x 764 Native Geometry)
             =================================================================== */}
          <div className="card-plane card-back-plane">
            {/* 1. Base Indian Screenprint Texture */}
            <div className="card-plane-bg card-back-texture" />

            {/* 2. Populated Content Layer */}
            {!isTemplateMode && (
              <div className="card-precise-overlay">
                {/* Top Arch Caption */}
                <div className="slot-back-top-caption">
                  <span>DIGITAL IDENTITY PASS</span>
                </div>

                {/* Large QR Code Frame (Fits symmetrically inside printed corner brackets) */}
                <div className="slot-large-qr-container" onClick={(e) => e.stopPropagation()}>
                  <div className="slot-qr-white-mat">
                    <QRCodeSVG value={url} size={226} level="H" marginSize={1} />
                  </div>
                  <p className="slot-qr-caption">SCAN WITH ANY PHONE TO OPEN ID</p>
                </div>

                {/* Secondary Info Box (Fits exactly inside printed notched outline) */}
                <div className="slot-secondary-box" onClick={(e) => e.stopPropagation()}>
                  <div className="slot-secondary-top">
                    <span className="slot-sec-pass">PASS ID: {publicId}</span>
                    <span className="slot-sec-active">● ACTIVE NFC PASS</span>
                  </div>
                  <div className="slot-sec-url">{url.replace(/^https?:\/\//, "")}</div>
                </div>

                {/* Bottom 5-Icon Social Grid (Transparent interactive hitboxes matching printed icons) */}
                <div className="slot-back-social-targets" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={profile.website_url || url}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-social-hitbox"
                    title="Website"
                  />
                  <a
                    href={profile.instagram_url || "https://instagram.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-social-hitbox"
                    title="Instagram"
                  />
                  <a
                    href={profile.linkedin_url || "https://linkedin.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-social-hitbox"
                    title="LinkedIn"
                  />
                  <a
                    href={profile.github_url || "https://x.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="slot-social-hitbox"
                    title="X / Twitter"
                  />
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="slot-social-hitbox"
                    title="YouTube"
                  />
                </div>

                {/* Back Footer */}
                <div className="slot-back-footer">
                  <span className="slot-back-code">NFC · 02</span>
                  <span className="slot-back-hint">TAP AGAIN TO FLIP FRONT</span>
                  <span className="slot-back-bharat">BHARAT • NEXUS</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
