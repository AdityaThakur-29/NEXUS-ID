"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile } from "@/lib/types";
import { profileUrl } from "@/lib/url";
import { NfcCardOperationsModal, CopyNfcUrlButton } from "@/components/nfc-card-operations";

interface CTable6Props {
  profiles?: Profile[];
}

const defaultMembers = [
  {
    id: "demo-1",
    public_id: "SC001",
    full_name: "Sarah Chen",
    role: "Admin",
    badge_tier: "Admin",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&dpr=2&q=80",
    organization: "Core Team",
  },
  {
    id: "demo-2",
    public_id: "MJ002",
    full_name: "Marcus Johnson",
    role: "Developer",
    badge_tier: "Technical Team",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    organization: "Engineering",
  },
  {
    id: "demo-3",
    public_id: "EP003",
    full_name: "Emily Park",
    role: "Designer",
    badge_tier: "Creative Lead",
    status: "active",
    photo_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&dpr=2&q=80",
    organization: "Design",
  },
];

function getRoleVariant(role?: string): "default" | "info-light" | "warning-light" | "outline" {
  if (!role) return "outline";
  const r = role.toLowerCase();
  if (r.includes("admin") || r.includes("lead") || r.includes("head")) return "default";
  if (r.includes("dev") || r.includes("tech") || r.includes("eng")) return "info-light";
  if (r.includes("design") || r.includes("creative")) return "warning-light";
  return "outline";
}

function getStatusVariant(status?: string): "success-light" | "destructive-light" | "outline" {
  if (status === "active") return "success-light";
  if (status === "disabled") return "destructive-light";
  return "outline";
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ID"
  );
}

export function CTable6({ profiles }: CTable6Props) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const items = profiles && profiles.length > 0 ? profiles : (defaultMembers as unknown as Profile[]);

  return (
    <div className="c-table-6-container">
      <Frame spacing="xs" className="c-table-6-frame">
        <FramePanel className="c-table-6-panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="hide-mobile">Role</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hide-mobile">NFC Card URL</TableHead>
                <TableHead style={{ textAlign: "right" }}>Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="reui-cell-member">
                      <Avatar size="sm">
                        {member.photo_url && (
                          <AvatarImage src={member.photo_url} alt={member.full_name} />
                        )}
                        <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="reui-member-meta">
                        <span className="reui-member-name">{member.full_name}</span>
                        <span className="reui-member-sub">
                          {member.organization || member.team || member.badge_tier || "Participant"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hide-mobile">
                    <Badge variant={getRoleVariant(member.role)} size="sm">
                      {member.role || "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/@${member.public_id}`} className="id">
                      {member.public_id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(member.status)} size="sm">
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hide-mobile">
                    <div className="reui-url-cell">
                      <code className="reui-card-url">{profileUrl(member.public_id)}</code>
                      <CopyNfcUrlButton url={profileUrl(member.public_id)} />
                    </div>
                  </TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    <div className="reui-actions-cell">
                      <button
                        type="button"
                        className="button primary reui-issue-btn"
                        onClick={() => setSelectedProfile(member)}
                        title="Open NFC card issuing workflow"
                      >
                        ⚡ Issue NFC
                      </button>
                      <Link className="button reui-edit-btn" href={`/admin/profiles/${member.id}/edit`}>
                        Edit
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </FramePanel>
      </Frame>

      {/* NFC Operations & Card Issuing Modal */}
      {selectedProfile && (
        <NfcCardOperationsModal
          profile={selectedProfile}
          isOpen={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

// Named alias matching ReUI pattern export
export const Pattern = CTable6;
