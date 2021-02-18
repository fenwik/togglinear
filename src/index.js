import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';
import arg from 'arg';

import { setConfig } from './utils';
import getConfig from './getConfig';
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
    await fs.rmdir(path.join(os.homedir(), '/.togglinear'), { recursive: true }).catch(console.error);
  }

  ui.updateBottomBar('Loading recent issues...');

  const config = await getConfig();
  setConfig(config);
  const issue = await searchIssue();

  ui.updateBottomBar('Starting new time entry...');

  const entry = await startTimeEntry(issue);

  ui.updateBottomBar(`Start new time entry: ${entry.data.description}`);
};

export default cli;
