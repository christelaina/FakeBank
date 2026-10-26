import type {
  DocumentMeta,
  ProfileChangeEntry,
  SecurityActivity,
  UserProfile,
} from "@/types/banking";

export const mockUser: UserProfile = {
  id: "user-demo-001",
  displayName: "Jordan Ellis",
  email: "jordan.ellis@example.ca",
  phone: "+1 (416) 555-0148",
  addressLine1: "220 King Street West",
  city: "Toronto",
  province: "ON",
  postalCode: "M5H 1K4",
  preferredLanguage: "en-CA",
  marketingEmails: false,
  twoFactorEnabled: true,
};

export const mockProfileHistory: ProfileChangeEntry[] = [
  {
    id: "chg-001",
    changedAt: "2026-09-28T13:20:00.000Z",
    field: "phone",
    summary: "Updated mobile number",
  },
  {
    id: "chg-002",
    changedAt: "2026-08-12T10:05:00.000Z",
    field: "preferredLanguage",
    summary: "Preferred language set to English (Canada)",
  },
  {
    id: "chg-003",
    changedAt: "2026-07-01T09:00:00.000Z",
    field: "twoFactorEnabled",
    summary: "Enabled authenticator app for sign-in",
  },
];

export const mockDocuments: DocumentMeta[] = [
  {
    id: "doc-001",
    name: "October 2026 Statement — Chequing.pdf",
    category: "Statements",
    uploadedAt: "2026-10-05T08:00:00.000Z",
    sizeBytes: 245760,
    mimeType: "application/pdf",
  },
  {
    id: "doc-002",
    name: "Tax Receipt 2025 — Interest.pdf",
    category: "Tax",
    uploadedAt: "2026-02-18T12:30:00.000Z",
    sizeBytes: 128450,
    mimeType: "application/pdf",
  },
  {
    id: "doc-003",
    name: "Account Agreement.pdf",
    category: "Agreements",
    uploadedAt: "2025-11-02T15:45:00.000Z",
    sizeBytes: 512000,
    mimeType: "application/pdf",
  },
];

export const mockSecurityActivity: SecurityActivity = {
  signIns: [
    { id: "signin-001", occurredAt: "2026-10-18T21:55:00.000Z" },
    { id: "signin-002", occurredAt: "2026-10-16T07:12:00.000Z" },
  ],
  notifications: [
    {
      id: "sec-note-002",
      createdAt: "2026-10-01T09:00:00.000Z",
      title: "Password last reviewed",
      body: "Your password was last changed more than 90 days ago. Consider updating it.",
      severity: "info",
      read: true,
    },
  ],
};

export const mockNotifications = [
  {
    id: "note-001",
    title: "e-Transfer received",
    body: "An Interac e-Transfer of $75.00 is pending.",
    createdAt: "2026-10-08T07:56:00.000Z",
  },
  {
    id: "note-002",
    title: "Statement ready",
    body: "Your October chequing statement is available in Documents.",
    createdAt: "2026-10-05T08:05:00.000Z",
  },
];
