"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/types";

interface Interactive3dCardProps {
  profile: Profile;
  url: string;
}

// Hindi name mapping / transliterator for Indian heritage aesthetic
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
  const firstName = profile.full_name.split(" ")[0].toUpperCase();

  // Handle Card Tap with 280° -> 180° rotation as requested
  function handleFlip() {
    if (isAnimating.current || !cardRef.current) return;
    isAnimating.current = true;

    if (!isFlipped) {
      // Rotate from 0° -> 280° -> 180° (Show back card)
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
      // Rotate back from 180° -> -100° -> 0° (Show front card)
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

  // Subtle 3D perspective tilt on desktop hover
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isAnimating.current || !containerRef.current || !cardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 7;
    const tiltY = (x / (rect.width / 2)) * 7;

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

  return (
    <div className="card-outer-wrapper">
      {/* Top Controller Bar */}
      <div className="card-controls-bar">
        <div className="card-flip-hint" onClick={handleFlip} role="button" tabIndex={0}>
          <span className="hint-icon">⇄</span>
          <span>{isFlipped ? "Tap card to flip front" : "Tap card to flip back (280° → 180°)"}</span>
        </div>

        <div className="template-toggle-group">
          <button
            type="button"
            className={`template-toggle-btn ${!isTemplateMode ? "active" : ""}`}
            onClick={() => setIsTemplateMode(false)}
            title="Populated Identity Card with typography and data"
          >
            ✦ Identity Card
          </button>
          <button
            type="button"
            className={`template-toggle-btn ${isTemplateMode ? "active" : ""}`}
            onClick={() => setIsTemplateMode(true)}
            title="Clean Indian Indie-Punk Design Template without typography"
          >
            ☵ Blank Template
          </button>
        </div>
      </div>

      {/* 3D Perspective Scene */}
      <div
        className="card-3d-scene"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="card-3d-wrapper"
          ref={cardRef}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label="3D Indian Indie-Punk NFC Profile Card. Tap to flip between front and back sides."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleFlip();
            }
          }}
        >
          {/* ================================================================
              FRONT FACE (Indian Indie-Punk / Vintage Street Art)
             ================================================================ */}
          <div className="card-face card-front indian-card-front">
            {/* Base Artwork Layer (Hand-crafted screenprint template) */}
            <div className="card-bg-layer card-front-bg" />

            {/* Overlaid Content Layer (Hidden in Blank Template Mode) */}
            {!isTemplateMode && (
              <div className="card-content-overlay">
                {/* 1. TOP HEADER */}
                <div className="front-top-header">
                  <div className="header-brand-group">
                    <h2 className="header-nexus-title">NEXUS ID <span className="brand-cross">+</span></h2>
                    <p className="header-sanskrit-quote">॥ कर्मण्येवाधिकारस्ते ॥</p>
                  </div>
                  <div className="header-meta-group">
                    <span className="meta-bharat">भारत</span>
                    <span className="meta-verified">
                      <span className="red-dot">●</span> VERIFIED MEMBER
                    </span>
                    <span className="meta-team">TEAM NEXUS</span>
                  </div>
                </div>

                {/* 2. LEFT VERTICAL CODE RIBBON */}
                <div className="front-left-ribbon">
                  <span className="ribbon-label">ID CODE</span>
                  <span className="ribbon-id">{profile.public_id}</span>
                  <span className="ribbon-motto">COLLABORATE • CREATE • ELEVATE</span>
                </div>

                {/* 3. CENTER PORTRAIT AVATAR */}
                <div className="front-avatar-container">
                  <div className="front-avatar-frame">
                    {profile.photo_url ? (
                      <img
                        src={profile.photo_url}
                        alt={profile.full_name}
                        className="front-avatar-img"
                      />
                    ) : (
                      <img
                        src="/assets/aditya-photo.jpg"
                        alt={profile.full_name}
                        className="front-avatar-img"
                        onError={(e) => {
                          // Fallback if image not found
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* 4. RIGHT STENCIL BADGE & TIGER PATCH */}
                <div className="front-right-stencil">
                  <span className="stencil-symbol">॥ ☨ ॥</span>
                  <span className="stencil-text">STAY CURIOUS<br />BUILD IMPACT</span>
                </div>

                <div className="front-tiger-patch">
                  <img
                    src="/assets/tiger-stamp.png"
                    alt="Soch Alag Kaam Damdar"
                    className="tiger-stamp-img"
                  />
                </div>

                {/* 5. IDENTITY DETAILS */}
                <div className="front-identity-area">
                  <div className="badge-tier-tag">
                    <span>{profile.badge_tier ? profile.badge_tier.toUpperCase() : "MEMBER"}</span>
                    <span className="tier-dot">•</span>
                    <span>{profile.public_id}</span>
                  </div>

                  <div className="name-and-mandala-row">
                    <div className="name-col">
                      <h1 className="profile-hero-name">{profile.full_name}</h1>
                      <p className="profile-hindi-name">{hindiName}</p>
                    </div>
                    <div className="mandala-icon" aria-hidden="true">
                      <svg viewBox="0 0 40 40" fill="none" className="mandala-svg">
                        <circle cx="20" cy="20" r="18" stroke="#d4cbb8" strokeWidth="1" strokeDasharray="2 3" />
                        <circle cx="20" cy="20" r="10" stroke="#b3381e" strokeWidth="1" />
                        <path d="M20 2 L20 38 M2 20 L38 20 M7 7 L33 33 M7 33 L33 7" stroke="#d4cbb8" strokeWidth="0.8" />
                        <circle cx="20" cy="20" r="3" fill="#df744a" />
                      </svg>
                    </div>
                  </div>

                  <div className="role-and-team-block">
                    <div className="role-bracket-row">
                      <span className="bracket">[</span>
                      <span className="role-text">{profile.role ? profile.role.toUpperCase() : "PARTICIPANT"}</span>
                      <span className="bracket">]</span>
                    </div>
                    {profile.team && (
                      <p className="team-text">{profile.team.toUpperCase()}</p>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="bio-description">{profile.bio}</p>
                  )}
                </div>

                {/* 6. LOWER SOCIAL LINKS & MINI QR ZONE */}
                <div className="front-lower-grid">
                  {/* Social Buttons Grid */}
                  <div className="social-quad-row">
                    <a
                      href={profile.github_url || "https://github.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="social-quad-btn"
                      title="GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="social-icon-svg">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </a>
                    <span className="quad-divider">+</span>
                    <a
                      href={profile.linkedin_url || "https://linkedin.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="social-quad-btn"
                      title="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="social-icon-svg">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <span className="quad-divider">+</span>
                    <a
                      href={profile.instagram_url || "https://x.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="social-quad-btn"
                      title="X / Twitter"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="social-icon-svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <span className="quad-divider">+</span>
                    <a
                      href={profile.website_url || url}
                      target="_blank"
                      rel="noreferrer"
                      className="social-quad-btn"
                      title="Website / NFC ID"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="social-icon-svg">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                      </svg>
                    </a>
                  </div>

                  {/* Front Mini QR Frame */}
                  <div className="front-mini-qr-box" onClick={(e) => e.stopPropagation()}>
                    <div className="mini-qr-frame">
                      <QRCodeSVG value={url} size={62} level="M" marginSize={0} />
                    </div>
                    <div className="mini-qr-label-col">
                      <span className="signal-icon">((●))</span>
                      <span className="mini-qr-text">TAP / SCAN<br />TO VIEW PROFILE</span>
                    </div>
                  </div>
                </div>

                {/* 7. FRONT FOOTER */}
                <div className="front-footer-strip">
                  <div className="footer-left-group">
                    <span className="nfc-signal-badge">((●))</span>
                    <span className="nfc-badge-code">NFC • 01 <span className="footer-cross">+</span></span>
                  </div>
                  <span className="footer-center-hint">SCAN / TAP TO CONNECT</span>
                  <div className="footer-right-group">
                    <span className="footer-namaste">नमस्ते</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================
              BACK FACE (Indian Indie-Punk / Large QR & Social Connection)
             ================================================================ */}
          <div className="card-face card-back indian-card-back">
            {/* Base Artwork Layer (Hand-crafted screenprint template) */}
            <div className="card-bg-layer card-back-bg" />

            {/* Overlaid Content Layer (Hidden in Blank Template Mode) */}
            {!isTemplateMode && (
              <div className="card-content-overlay back-content-overlay">
                {/* 1. TOP ORNAMENTAL BANNER TITLE */}
                <div className="back-top-banner">
                  <span className="back-banner-caption">DIGITAL IDENTITY PASS</span>
                </div>

                {/* 2. LARGE QR CODE CENTER SECTION */}
                <div className="back-qr-zone" onClick={(e) => e.stopPropagation()}>
                  <div className="back-large-qr-frame">
                    <div className="qr-corner-bracket tl">┌</div>
                    <div className="qr-corner-bracket tr">┐</div>
                    <div className="qr-corner-bracket bl">└</div>
                    <div className="qr-corner-bracket br">┘</div>
                    <div className="qr-code-white-mat">
                      <QRCodeSVG value={url} size={224} level="H" marginSize={1} />
                    </div>
                  </div>
                  <p className="back-qr-caption">SCAN WITH ANY SMARTPHONE CAMERA TO OPEN ID</p>
                </div>

                {/* 3. SECONDARY RECTANGULAR INFO BOX */}
                <div className="back-secondary-box" onClick={(e) => e.stopPropagation()}>
                  <div className="secondary-row-top">
                    <span className="secondary-id-badge">PASS ID: {profile.public_id}</span>
                    <span className="secondary-status">ACTIVE NFC PASS</span>
                  </div>
                  <div className="secondary-url-text">{url.replace(/^https?:\/\//, "")}</div>
                </div>

                {/* 4. HORIZONTAL SOCIAL / CONNECTION BUTTONS */}
                <div className="back-social-bar" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={profile.website_url || url}
                    target="_blank"
                    rel="noreferrer"
                    className="back-social-btn"
                    title="Website"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-btn-svg">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                    </svg>
                  </a>
                  <span className="back-btn-cross">+</span>
                  <a
                    href={profile.instagram_url || "https://instagram.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="back-social-btn"
                    title="Instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-btn-svg">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                  <span className="back-btn-cross">+</span>
                  <a
                    href={profile.linkedin_url || "https://linkedin.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="back-social-btn"
                    title="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="back-btn-svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <span className="back-btn-cross">+</span>
                  <a
                    href={profile.github_url || "https://x.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="back-social-btn"
                    title="X / Twitter"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="back-btn-svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <span className="back-btn-cross">+</span>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="back-social-btn"
                    title="YouTube"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="back-btn-svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>

                {/* 5. BACK FOOTER */}
                <div className="back-footer-strip">
                  <span className="footer-code-left">NFC · 02</span>
                  <span className="footer-hint-center">TAP AGAIN TO FLIP FRONT</span>
                  <span className="footer-code-right">BHARAT • NEXUS</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
