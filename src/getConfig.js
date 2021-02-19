import { promises as fs } from 'fs';
import inquirer from 'inquirer';

import {
  configPath,
  configFile
} from './utils';

import {
  getTogglUserInfo,
  getLinearUserInfo
} from './requests';

const getConfig = () => fs.readFile(configFile)
  .then((json) => {
    const data = JSON.parse(json);

    if (!data.togglApiToken || !data.linearApiKey) {
      throw new Error('Corrupted config file');
    }

    return data;
  })
  .catch(async() => {
    const { togglApiToken } = await inquirer.prompt({
      type: 'input',
      name: 'togglApiToken',
      message: 'Enter your Toggl API token:',
      validate: (value) => {
        if (!value) {
          return 'This is required';
        }

        return getTogglUserInfo(value).then(({ ok }) => ok || 'Invalid API token');
      }
    });

    const { linearApiKey } = await inquirer.prompt({
      type: 'input',
      name: 'linearApiKey',
      message: 'Enter your Linear API key:',
      validate: (value) => {
        if (!value) {
          return 'This is required';
        }

        return getLinearUserInfo(value).then(({ ok }) => ok || 'Invalid API key');
      }
    });

    const config = {
      togglApiToken,
      linearApiKey
    };

    await fs.mkdir(configPath, { recursive: true });
    await fs.writeFile(configFile, JSON.stringify(config), 'utf8');

    return config;
  });

export default getConfig;
