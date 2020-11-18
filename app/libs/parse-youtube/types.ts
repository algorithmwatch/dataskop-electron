// https://github.com/SuspiciousLookingOwl/scrape-yt/blob/master/src/common/types.ts

export interface SearchOptions {
  type?: 'video' | 'channel' | 'playlist' | 'all';
  limit?: number;
  page?: number;
}

export interface Video {
  id: string;
  title: string;
  duration: number | null;
  thumbnail?: string;
  channel: Channel;
  uploadDate?: string;
  viewCount: number | null;
  description?: string;
}

export interface VideoDetailed extends Video {
  viewCount: number | null;
  likeCount: number | null;
  dislikeCount: number | null;
  isLiveContent: boolean;
  tags: string[];
}

export interface HistoryVideo extends Video {
  watchedAt: string;
  resumeWatching: number | null;
}

export interface HistorySearch {
  query: string;
  searchedAt: string;
}

export interface HistoryComment {
  text: string;
  videoUrl: string;
  videoTitle: string;
  commentUrl: string;
  commentedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  thumbnail: string;
  channel?: Channel;
  videoCount: number;
}

export interface PlaylistDetailed extends Playlist {
  viewCount: number;
  lastUpdatedAt: string;
  videos: Video[];
}

export interface Channel {
  id?: string;
  name: string;
  url: string;
  description?: string;
  thumbnail?: string;
  videoCount?: number;
}

export interface Subscription extends Channel {
  subscribersCount: string;
  notificationSetting: string;
}

export type SearchType<T> = T extends { type: 'video' }
  ? Video
  : T extends { type: 'channel' }
  ? Channel
  : T extends { type: 'playlist' }
  ? Playlist
  : Video | Channel | Playlist;
