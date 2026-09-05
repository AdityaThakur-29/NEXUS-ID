"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { QRCodeSVG } from "qrcode.react";
import type { Profile } from "@/lib/types";

interface Interactive3dCardProps {
  profile: Profile;
  url: string;
}

export function Interactive3dCard({ profile, url }: Interactive3dCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const isAnimating = useRef(false);

  const initials = profile.full_name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  // Subtle interactive 3D tilt tracking when hovering on desktop
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isAnimating.current || !containerRef.current || !cardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 8;
    const tiltY = (x / (rect.width / 2)) * 8;

    gsap.to(cardRef.current, {
      rotateX: tiltX,
      duration: 0.3,
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

  // Social Links helper
  const hasLinks =
    profile.linkedin_url ||
    profile.github_url ||
    profile.website_url ||
    profile.instagram_url;

  return (
    <div
      className="card-3d-scene"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-flip-hint">
        <span className="hint-icon">⇄</span>
        <span>Tap card to flip</span>
      </div>

      <div
        className="card-3d-wrapper"
        ref={cardRef}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="3D NFC Profile Card. Tap to flip between front and back sides."
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* ==================== FRONT FACE (IMAGE 1) ==================== */}
        <div className="card-face card-front">
          <div className="card-inner-glow" />

          {/* Top Bar */}
          <div className="card-header-row">
            <span className="card-brand-label">NEXUS ID</span>
            <span className="verified-badge">
              ● {profile.is_verified ? "Verified member" : "Member"}
            </span>
          </div>

          {/* Avatar with cyan/violet layered glow rings */}
          <div className="card-avatar-ring-outer">
            <div className="card-avatar-ring-inner">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="card-avatar-img"
                />
              ) : (
                <div className="card-avatar-fallback">{initials}</div>
              )}
            </div>
          </div>

          {/* Identity Metadata */}
          <div className="card-identity-block">
            <p className="card-badge-eyebrow">
              {profile.badge_tier || "MEMBER"} · {profile.public_id}
            </p>
            <h1 className="card-full-name">{profile.full_name}</h1>
            <p className="card-role">{profile.role || "Participant"}</p>
            {profile.team && <p className="card-team">{profile.team}</p>}
            {profile.bio && <p className="card-bio">{profile.bio}</p>}
          </div>

          {/* Skills Chips */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="card-skills-row">
              {profile.skills.map((skill) => (
                <span className="card-skill-pill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Card Footer */}
          <footer className="card-footer-row">
            <span>SCAN / TAP TO CONNECT</span>
            <span>NFC · 01</span>
          </footer>
        </div>

        {/* ==================== BACK FACE (IMAGE 2) ==================== */}
        <div className="card-face card-back">
          <div className="card-inner-glow" />

          {/* Header */}
          <div className="card-back-header">
            <p className="card-back-eyebrow">CONNECT WITH {firstName}</p>
            <h2 className="card-back-title">Digital ID</h2>
          </div>

          {/* Social Links */}
          <div className="card-back-links">
            {profile.linkedin_url && (
              <a
                className="card-back-link-btn"
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span>LinkedIn</span>
                <span className="link-arrow">↗</span>
              </a>
            )}
            {profile.github_url && (
              <a
                className="card-back-link-btn"
                href={profile.github_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span>GitHub</span>
                <span className="link-arrow">↗</span>
              </a>
            )}
            {profile.website_url && (
              <a
                className="card-back-link-btn"
                href={profile.website_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Website</span>
                <span className="link-arrow">↗</span>
              </a>
            )}
            {profile.instagram_url && (
              <a
                className="card-back-link-btn"
                href={profile.instagram_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Instagram</span>
                <span className="link-arrow">↗</span>
              </a>
            )}
            {!hasLinks && (
              <div className="card-back-no-links">
                <span>Direct NFC event pass ready</span>
              </div>
            )}
          </div>

          {/* QR Code Container */}
          <div className="card-back-qr-container">
            <div className="card-back-qr-box" onClick={(e) => e.stopPropagation()}>
              <QRCodeSVG value={url} size={150} level="H" marginSize={1} />
            </div>
            <p className="card-back-qr-caption">Scan to open this ID</p>
          </div>

          {/* Back Footer */}
          <footer className="card-footer-row">
            <span>TAP AGAIN TO FLIP</span>
            <span>NFC · 02</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
