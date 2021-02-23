import chalk from 'chalk';
import optionator from 'optionator';

import { version } from '../package.json';
import {
  setConfig,
  deleteConfigFile,
  deleteProjectsMapping
} from './utils';
import getConfig from './getConfig';
import getIssue from './getIssue';
import searchIssue from './searchIssue';
import startTimeEntry from './startTimeEntry';

const CLIOptions = optionator({
  prepend: 'togglinear [taskID]',
  options: [
    {
      option: 'version',
      alias: 'v',
      type: 'Boolean',
      description: 'Output the version number'
    },
    {
      option: 'help',
      alias: 'h',
      type: 'Boolean',
      description: 'Show help'
    },
    {
      option: 'reset-config',
      alias: 'rc',
      type: 'Boolean',
      description: 'Delete config file with Linear API key, Toggl API token and projects mapping'
    },
    {
      option: 'reset-projects-mapping',
      alias: 'rpm',
      type: 'Boolean',
      description: 'Delete projects map between Linear and Toggl'
    }
  ]
});

const startTimeTrack = async(issueId) => {
  const config = await getConfig();
  setConfig(config);

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

const cli = (args) => {
  const options = CLIOptions.parseArgv(args);

  if (options.version) {
    console.log(`Togglinear CLI version: ${chalk.green(version)}`);
    return;
  }

  if (options.help) {
    console.log(CLIOptions.generateHelp());
    return;
  }

  if (options.resetConfig) {
    deleteConfigFile().then(() => {
      console.log('Config file deleted successfully');
    }).catch((error) => {
      console.error(error);
    });
    return;
  }

  if (options.resetProjectsMapping) {
    deleteProjectsMapping().then(() => {
      console.log('Projects mapping deleted successfully');
    }).catch((error) => {
      console.error(error);
    });
    return;
  }

  const issueId = options._[0] || null;

  startTimeTrack(issueId).catch((error) => {
    console.error(error);
  });
};

export default cli;
