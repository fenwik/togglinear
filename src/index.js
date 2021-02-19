import inquirer from 'inquirer';
import arg from 'arg';

import {
  setConfig,
  deleteConfigFile,
  resetProjectsMapping
} from './utils';
import getConfig from './getConfig';
import searchIssue from './searchIssue';
import startTimeEntry from './startTimeEntry';

const ui = new inquirer.ui.BottomBar();

process.on('SIGINT', () => {
  ui.close();
});

const cli = async(args) => {
  const flags = arg({
    '--reset-config': Boolean,
    '--reset-projects-mapping': Boolean
  },
  {
    argv: args.slice(2)
  });

  if (flags['--reset-config']) {
    await deleteConfigFile();
  }

  ui.updateBottomBar('Loading recent issues...');

  const config = await getConfig();
  setConfig(config);

  if (flags['--reset-projects-mapping']) {
    await resetProjectsMapping();
  }

  const issue = await searchIssue();

  ui.updateBottomBar('Starting new time entry...');

  const entry = await startTimeEntry(issue);

  ui.updateBottomBar(`Start new time entry: ${entry.data.description}`);
};

export default cli;
