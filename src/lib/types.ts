export type ID = string;

export type UpdateKind = "update" | "milestone" | "release" | "blocker";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Attachment {
  id: ID;
  name: string;
  type: string; // mime type
  size: number; // bytes
  dataUrl: string; // base64 data URL
}

export interface Project {
  id: ID;
  name: string;
  initials: string;
  tagline: string;
  description: string;
  accent: string; // hex accent color
  status: "active" | "planning" | "paused";
  logo?: string; // path under /public
  links?: ProjectLink[];
  createdAt: number;
}

export interface Update {
  id: ID;
  projectId: ID;
  author: string;
  title: string;
  body: string;
  kind: UpdateKind;
  attachments?: Attachment[];
  createdAt: number;
}

export interface Note {
  id: ID;
  projectId: ID;
  author: string;
  body: string;
  attachments?: Attachment[];
  createdAt: number;
}

export interface AppNotification {
  id: ID;
  projectId: ID;
  title: string;
  body: string;
  audience: string;
  createdAt: number;
  read: boolean;
}

export interface ChatMessage {
  id: ID;
  projectId: ID;
  author: string;
  body: string;
  createdAt: number;
}

export interface AppState {
  projects: Project[];
  updates: Update[];
  notes: Note[];
  notifications: AppNotification[];
  messages: ChatMessage[];
}
