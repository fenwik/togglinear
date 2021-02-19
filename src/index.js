import inquirer from 'inquirer';
import arg from 'arg';

import { setConfig } from './utils';
import getConfig from './getConfig';
import resetConfig from './resetConfig';
import searchIssue from './searchIssue';
import startTimeEntry from './startTimeEntry';

const ui = new inquirer.ui.BottomBar();

const cli = async(args) => {
  const flags = arg({
    '--reset-config': Boolean
  },
  {
    argv: args.slice(2)
  });

  if (flags['--reset-config']) {
    await resetConfig();
  }

  process.on('SIGINT', () => {
    ui.close();
  });

  ui.updateBottomBar('Loading recent issues...');

  const config = await getConfig();
  setConfig(config);
  const issue = await searchIssue();

  ui.updateBottomBar('Starting new time entry...');

  const entry = await startTimeEntry(issue);

  ui.updateBottomBar(`Start new time entry: ${entry.data.description}`);
};

export default cli;
