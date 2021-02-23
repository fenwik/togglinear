import { promises as fs } from 'fs';
import chalk from 'chalk';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';
import btoa from 'btoa';
import { compareTwoStrings } from 'string-similarity';
import inquirer from 'inquirer';

let CONFIG = {
  togglApiToken: null,
  linearApiKey: null,
  projectsMap: {}
};

export const configPath = path.join(os.homedir(), '/.togglinear');

export const configFile = path.join(configPath, '/config.json');

export const setConfig = (upd) => {
  CONFIG = {
    ...CONFIG,
    ...upd
  };
};

export const saveConfigFile = async(upd) => {
  const data = {
    ...CONFIG,
    ...upd
  };

  await fs.mkdir(configPath, { recursive: true });
  await fs.writeFile(configFile, JSON.stringify(data), 'utf8');
};

export const deleteConfigFile = async() => fs.rmdir(configPath, { recursive: true });

export const createRequest = async(endpoint, {
  headers = {},
  method = 'GET',
  sendData
}) => {
  const options = {
    method,
    headers
  };

  if (sendData) {
    options.body = JSON.stringify(sendData);
  }

  const response = await fetch(endpoint, options);

  return response;
};

export const createTogglApiRequest = async(endpoint, options = {}) => {
  const {
    method,
    token,
    sendData
  } = options;
  const credentials = btoa(`${token || CONFIG.togglApiToken}:api_token`);
  const response = await createRequest(`https://api.track.toggl.com/api/v8${endpoint}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    sendData
  });

  const { status, ok } = response;
  const result = { status, ok };

  if (!ok) {
    const text = await response.text();
    console.warn(method, endpoint, status, response.statusText);
    console.warn(text);

    return result;
  }

  return response.json()
    .then((data) => ({ ...result, data }))
    .catch(() => result);
};

export const createLinearApiRequest = async(query, options = {}) => {
  const {
    variables,
    apiKey
  } = options;
  const response = await createRequest('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: apiKey || CONFIG.linearApiKey,
      'Content-Type': 'application/json'
    },
    sendData: { query, variables }
  });

  const { status, ok } = response;
  const result = { status, ok };

  if (!ok) {
    const text = await response.text();
    console.warn('POST', 'https://api.linear.app/graphql', status, response.statusText);
    console.warn(text);

    return result;
  }

  return response.json()
    .then((data) => {
      if (!data || (Array.isArray(data.errors) && data.errors.length)) {
        result.ok = false;
      }

      return {
        ...result,
        data
      };
    })
    .catch(() => result);
};

export const processIssue = (issue) => {
  const description = `${issue.identifier} ${issue.title}`;
  const project = issue.project ? issue.project : null;
  const state = issue.state ? issue.state : null;

  return {
    description,
    project,
    state
  };
};

export const buildIssueChoiceItem = (issue) => {
  const {
    description,
    project,
    state
  } = processIssue(issue);
  const meta = `${project ? ` ${chalk.hex(project.color).bold(project.name)}` : ''}`
    + `${state ? ` ${chalk.hex(state.color).bold(`(${state.name})`)}` : ''}`;

  return {
    name: `${description}${meta}`,
    short: issue.identifier,
    value: {
      description,
      project
    }
  };
};

export const getPid = async(project, togglProjects) => {
  if (!togglProjects.length) {
    return null;
  }

  if (project && typeof CONFIG.projectsMap[project.id] !== 'undefined') {
    return CONFIG.projectsMap[project.id];
  }

  const projectName = project ? project.name.toLowerCase() : null;
  const projects = togglProjects.map(({
    name,
    id,
    hex_color: hex
  }) => ({
    name: chalk.hex(hex).bold(name),
    value: id,
    similarity: projectName
      ? compareTwoStrings(projectName, name.toLowerCase())
      : 0
  }));
  projects.sort((a, b) => b.similarity - a.similarity);
  const similarProjects = projects.filter(({ similarity }) => similarity >= 0.5);
  const otherProjects = projects.filter(({ similarity }) => similarity < 0.5);

  let choices = [];

  if (similarProjects.length) {
    choices = [
      ...similarProjects,
      new inquirer.Separator()
    ];
  }

  choices = [
    ...choices,
    {
      name: '-- No project --',
      value: null
    },
    ...otherProjects
  ];

  const answer = await inquirer.prompt({
    type: 'list',
    name: 'project',
    message: 'Select project:',
    loop: false,
    choices
  });

  const pid = typeof answer.project === 'number' ? answer.project : null;

  if (project.id) {
    CONFIG.projectsMap = {
      ...CONFIG.projectsMap,
      [project.id]: pid
    };
  }

  saveConfigFile();

  return pid;
};

export const deleteProjectsMapping = async() => {
  CONFIG.projectsMap = {};

  await saveConfigFile();
};
