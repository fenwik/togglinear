import inquirer from 'inquirer';
import arg from 'arg';

import {
  setConfig,
  deleteConfigFile,
  resetProjectsMapping
} from './utils';
import getConfig from './getConfig';
import getIssue from './getIssue';
import searchIssue from './searchIssue';
import startTimeEntry from './startTimeEntry';

const ui = new inquirer.ui.BottomBar();

process.on('SIGINT', () => {
  ui.close();
});

const cli = async(argv) => {
  const args = arg({
    '--reset-config': Boolean,
    '--reset-projects-mapping': Boolean
  },
  {
    argv
  });

  if (args['--reset-config']) {
    await deleteConfigFile();
  }

  ui.updateBottomBar('Loading recent issues...');

  const config = await getConfig();
  setConfig(config);

  if (args['--reset-projects-mapping']) {
    await resetProjectsMapping();
  }

  const issueId = args._[2];
  const issue = issueId ? await getIssue(issueId) : await searchIssue();

  if (!issue) {
    ui.updateBottomBar('');
    ui.log.write(`Can't find issue ${issueId}`);
    ui.close();
    return;
  }

  throw new Error('TEST');

  ui.updateBottomBar('Starting new time entry...');

  const entry = await startTimeEntry(issue);

  ui.updateBottomBar(`Start new time entry: ${entry.data.description}`);
};

export default cli;
