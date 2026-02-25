export interface NASAResult {
    title: string;
    url: string;
    explanation: string;
    media_type: string;
    date: string;
}
export declare function getNASAKey(): Promise<string>;
export declare function getAPOD(): Promise<NASAResult | null>;
