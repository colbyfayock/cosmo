import { getWeather, getAPOD, getTopStories, sendMessageWithFallback, loadConfig } from '@cosmo/lib';

const config = loadConfig();
const CHAT_ID = config?.telegram?.chatId || '8464661788';

async function main() {
  const weatherResult = await getWeather();
  const weather = weatherResult.text;
  const service = weatherResult.service;
  
  const nasa = await getAPOD();
  const hn = await getTopStories(3);

  const messageParts: string[] = [
    "*THE PULSAR*",
    "Good morning, Colby! Here is your daily beam:",
    ""
  ];

  messageParts.push("🌤️ **Weather (19341)**");
  messageParts.push(weather);
  messageParts.push("*Via " + service + "*");
  messageParts.push("");

  if (hn.length > 0) {
    messageParts.push("📰 **Top of Hacker News**");
    hn.forEach((story) => {
      messageParts.push("• [" + story.title + "](" + story.url + ")");
    });
    messageParts.push("");
  }

  if (nasa) {
    messageParts.push("🚀 **NASA APOD**");
    messageParts.push("**" + nasa.title + "**");
    messageParts.push(nasa.explanation);
    messageParts.push("");
  }

  messageParts.push("🪼 Have a great day!");
  
  const message = messageParts.join("\n");
  const photoUrl = nasa?.url;
  
  console.log('Sending to Telegram...');
  const result = await sendMessageWithFallback(CHAT_ID, message, photoUrl);
  console.log('Sent successfully!');
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
