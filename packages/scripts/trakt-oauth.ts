import readline from 'readline';

const clientId = process.env.TRAKT_CLIENT_ID;
const clientSecret = process.env.TRAKT_CLIENT_SECRET;
const redirectUri = 'http://localhost';

if (!clientId || !clientSecret) {
  console.error('Error: TRAKT_CLIENT_ID and/or TRAKT_CLIENT_SECRET are not set in the environment.');
  process.exit(1);
}

console.log('Step 1: Authorization URL');
const authUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
console.log('Open this URL in your browser to authorize:');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code: ', async (authCode: string) => {
  rl.close();

  console.log('Step 2: Exchanging code for tokens...');

  try {
    const response = await fetch('https://api.trakt.tv/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: any = await response.json();
    console.log('Access Token:', data.access_token);
    console.log('Refresh Token:', data.refresh_token);
    console.log('Expiration (seconds):', data.expires_in);

    console.log('\nSave these tokens to ~/.config/trakt/config.yaml');
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Error:', error.message);
    } else {
        console.error('An unknown error occurred:', error);
    }
  }
});
