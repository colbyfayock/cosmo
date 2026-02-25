export interface WeatherResult {
    text: string;
    service: string;
}
export declare function getWeather(lat?: number, lon?: number): Promise<WeatherResult>;
