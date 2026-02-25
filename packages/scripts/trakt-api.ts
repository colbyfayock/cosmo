import { searchItem, markWatched, rateItem, getHistory, getUser, refreshToken } from '@cosmo/lib';

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  const type = args[1];
  const title = args[2];
  const val1 = args[3];
  const val2 = args[4];

  if (!action) {
    console.log('Usage: npx tsx trakt-api.ts [search|watched|rate|history|me|refresh] [movie|show] "Title" [rating] [episode]');
    return;
  }

  try {
    switch (action) {
      case 'search':
        if (!type || !title) throw new Error('Usage: search [movie|show] "Title"');
        console.log(JSON.stringify(await searchItem(type as 'movie' | 'show', title), null, 2));
        break;
      case 'watched':
        if (!type || !title) throw new Error('Usage: watched [movie|show] "Title"');
        console.log(JSON.stringify(await markWatched(type as 'movie' | 'show', title, val1 ? parseInt(val1) : undefined, val2 ? parseInt(val2) : undefined), null, 2));
        break;
      case 'rate':
        if (!type || !title || !val1) throw new Error('Usage: rate [movie|show] "Title" [rating]');
        console.log(JSON.stringify(await rateItem(type as 'movie' | 'show', title, parseInt(val1)), null, 2));
        break;
      case 'history':
        console.log(JSON.stringify(await getHistory(type as 'movies' | 'shows', val1 ? parseInt(val1) : 10), null, 2));
        break;
      case 'me':
        console.log(JSON.stringify(await getUser(), null, 2));
        break;
      case 'refresh':
        console.log(JSON.stringify(await refreshToken(), null, 2));
        break;
      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
