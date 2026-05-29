export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  status?: boolean;
  pinned?: boolean;
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  status?: boolean;
  pinned?: boolean;
}

export interface FetchAnnouncementsParams {
  title?: string;
  status?: boolean;
  page?: number;
  per_page?: number;
}

export const ANNOUNCEMENT_TYPE_MARKER = 'announcement' as const;
