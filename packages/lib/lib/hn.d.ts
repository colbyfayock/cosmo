export interface HNItem {
    title: string;
    url: string;
}
export declare function getTopStories(limit?: number): Promise<HNItem[]>;
