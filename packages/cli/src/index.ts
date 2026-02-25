import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { traktCommand } from './commands/trakt.js';

yargs(hideBin(process.argv))
  .command(traktCommand)
  .demandCommand(1, 'Specify a command')
  .help().alias('h', 'help')
  .parse();
