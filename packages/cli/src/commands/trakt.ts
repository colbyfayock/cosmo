import { searchItem, markWatched, rateItem, getHistory, getUser, refreshToken, getClientId, getClientSecret, saveConfig } from '@cosmo/lib';

export const traktCommand = {
  command: 'trakt <action>',
  describe: 'Trakt',
  builder: (yargs: any) => yargs
    .positional('action', { 
      choices: ['search', 'watched', 'rate', 'history', 'me', 'refresh', 'auth'], 
      demandOption: true 
    })
    .option('type', { alias: 't', choices: ['movie', 'show'] })
    .option('title', { alias: 'm', type: 'string' })
    .option('rating', { alias: 'r', type: 'number' })
    .option('limit', { alias: 'l', type: 'number', default: 10 })
    .option('code', { alias: 'c', type: 'string', description: 'Auth code for trakt auth' }),
  
  handler: async (argv: any) => {
    const action = argv.action as string;
    const type = argv.type as 'movie' | 'show' | undefined;
    const title = argv.title as string | undefined;
    const rating = argv.rating as number | undefined;
    const limit = argv.limit as number;
    const code = argv.code as string | undefined;
    
    try {
      switch (action) {
        case 'auth': {
          if (!code) {
            console.log('Usage: cosmo trakt auth --code <CODE>');
            console.log('');
            console.log('Step 1: Get auth code:');
            const clientId = await getClientId();
            console.log('  https://trakt.tv/oauth/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=http://localhost');
            console.log('');
            console.log('Step 2: Run: cosmo trakt auth --code <CODE>');
            process.exit(0);
          }
          
          const clientId = await getClientId();
          const clientSecret = await getClientSecret();
          const redirectUri = 'http://localhost';
          
          console.log('Exchanging code for tokens...');
          const response = await fetch('https://api.trakt.tv/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });
          
          if (!response.ok) {
            console.error('Error:', response.status, await response.text());
            process.exit(1);
          }
          
          const data: any = await response.json();
          saveConfig({
            'access-token': data.access_token,
            'refresh-token': data.refresh_token,
          });
          console.log('Tokens saved!');
          break;
        }
        case 'search':
          if (!type || !title) { console.error('Usage: cosmo trakt search --type movie --title "Title"'); process.exit(1); }
          console.log(JSON.stringify(await searchItem(type, title), null, 2));
          break;
        case 'watched':
          if (!type || !title) { console.error('Usage: cosmo trakt watched --type movie --title "Title"'); process.exit(1); }
          console.log(JSON.stringify(await markWatched(type, title), null, 2));
          break;
        case 'rate':
          if (!type || !title || !rating) { console.error('Usage: cosmo trakt rate --type movie --title "Title" --rating 8'); process.exit(1); }
          console.log(JSON.stringify(await rateItem(type, title, rating), null, 2));
          break;
        case 'history':
          console.log(JSON.stringify(await getHistory(type as 'movies' | 'shows' || 'movies', limit), null, 2));
          break;
        case 'me':
          console.log(JSON.stringify(await getUser(), null, 2));
          break;
        case 'refresh':
          console.log(JSON.stringify(await refreshToken(), null, 2));
          break;
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
};
