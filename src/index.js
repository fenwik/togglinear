import arg from 'arg';
import chalk from 'chalk';

import {
  setConfig,
  deleteConfigFile,
  deleteProjectsMapping
} from './utils';
import getConfig from './getConfig';
import getIssue from './getIssue';
import searchIssue from './searchIssue';
import startTimeEntry from './startTimeEntry';

const seq = async({
  resetConfig,
  resetProjectsMapping,
  issueId
}) => {
  if (resetConfig) {
    await deleteConfigFile();
  }

  const config = await getConfig();
  setConfig(config);

  if (resetProjectsMapping) {
    await deleteProjectsMapping();
  }

  console.log('Searching for issue...');

  const issue = issueId ? await getIssue(issueId) : await searchIssue();

  if (!issue) {
    console.log(chalk.red(`Can't find issue ${issueId}`));
    return;
  }

  const [entry, project] = await startTimeEntry(issue);

  console.log('\nStart new time entry:'
    + `\n${chalk.gray(entry.data.description)}`
    + `\n${project ? chalk.hex(project.hex_color.toUpperCase()).bold(project.name) : ''}\n`);
};

const cli = (argv) => {
  const args = arg({
    '--reset-config': Boolean,
    '--reset-projects-mapping': Boolean
  },
  {
    argv
  });

  const options = {
    resetConfig: args['--reset-config'] || false,
    resetProjectsMapping: args['--reset-projects-mapping'] || false,
    issueId: args._[2] || null
  };

  seq(options).catch((error) => {
    console.error(error);
  });
};

export default cli;
