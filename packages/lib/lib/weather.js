import { execSync } from 'child_process';
async function robustFetch(url, timeout = 10) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout * 1000);
    try {
        const response = await fetch(url, { signal: controller.signal });
        return response;
    }
    finally {
        clearTimeout(id);
    }
}
export async function getWeather(lat = 40.02, lon = -75.64) {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch';
    try {
        const res = await robustFetch(url, 5);
        if (res.ok) {
            const data = await res.json();
            const current = data.current;
            const codes = {
                0: '☀️ Clear', 1: '🌤️ Mainly Clear', 2: '⛅ Partly Cloudy', 3: '☁️ Overcast',
                45: '🌫️ Foggy', 48: '🌫️ Rime Fog', 51: '🌦️ Light Drizzle', 61: '🌧️ Rain',
                71: '❄️ Snow', 95: '⛈️ Thunderstorm'
            };
            const condition = codes[current.weather_code] || '🌡️';
            return {
                text: condition + ' ' + Math.round(current.temperature_2m) + '°F (Feels like ' + Math.round(current.apparent_temperature) + '°F), ' + current.relative_humidity_2m + '% Humidity',
                service: 'Open-Meteo'
            };
        }
    }
    catch (err) {
        console.error('Open-Meteo failed, falling back to wttr.in...', err.message);
    }
    try {
        const res = execSync('curl -s "https://wttr.in/19341?format=%c+%t+%C+(Feels+like+%f)&u" --connect-timeout 5').toString().trim();
        return { text: res, service: 'wttr.in' };
    }
    catch (e) {
        return { text: 'Weather data unavailable.', service: 'none' };
    }
}
