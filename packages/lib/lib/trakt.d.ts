export interface TraktConfig {
    'access-token': string;
    'refresh-token': string;
}
export declare function loadConfig(): TraktConfig;
export declare function saveConfig(config: TraktConfig): void;
export declare function getClientId(): Promise<string>;
export declare function getClientSecret(): Promise<string>;
export declare function refreshToken(): Promise<string>;
export declare function getHeaders(): Promise<Record<string, string>>;
export declare function ensureValidToken(): Promise<void>;
export interface TraktIds {
    trakt: number;
    slug: string;
    imdb?: string;
    tmdb?: number;
}
export interface TraktMovie {
    title: string;
    year: number;
    ids: TraktIds;
}
export interface TraktShow {
    title: string;
    year: number;
    ids: TraktIds;
}
export interface TraktItem {
    movie?: TraktMovie;
    show?: TraktShow;
}
export declare function searchItem(type: 'movie' | 'show', title: string): Promise<TraktItem | null>;
export declare function markWatched(type: 'movie' | 'show', title: string, season?: number, episode?: number): Promise<unknown>;
export declare function rateItem(type: 'movie' | 'show', title: string, rating: number): Promise<unknown>;
export declare function getHistory(type?: 'movies' | 'shows', limit?: number): Promise<unknown>;
export declare function getUser(): Promise<unknown>;
