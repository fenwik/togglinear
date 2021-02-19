import fetch from 'node-fetch';
import btoa from 'btoa';

let CONFIG = {
  togglApiToken: null,
  linearApiKey: null
};

export const setConfig = (config) => {
  CONFIG = {
    ...CONFIG,
    ...config
  };
};

export const createRequest = async(path, {
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

  const response = await fetch(path, options);

  return response;
};

export const createTogglApiRequest = async(path, {
  method,
  token,
  sendData
}) => {
  const credentials = btoa(`${token || CONFIG.togglApiToken}:api_token`);
  const response = await createRequest(`https://api.track.toggl.com/api/v8${path}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    sendData
  });

  const { status, ok, statusText } = response;
  const result = { status, ok };

  if (!ok) {
    const text = await response.text();
    console.warn(method, path, status, statusText);
    console.log(text);

    return result;
  }

  return response.json()
    .then((data) => ({ ...result, data }))
    .catch(() => result);
};

export const createLinearApiRequest = async(query, {
  variables,
  apiKey
}) => {
  const response = await createRequest('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: apiKey || CONFIG.linearApiKey,
      'Content-Type': 'application/json'
    },
    sendData: { query, variables }
  });

  const { status, ok, statusText } = response;
  const result = { status, ok };

  if (!ok) {
    console.warn('POST', 'https://api.linear.app/graphql', status, statusText);
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

export const requestErrorHandler = (error) => {
  throw new Error(error);
};

export const buildIssueChoiceItem = (issue) => {
  const description = `${issue.identifier} ${issue.title}`;
  const projectFull = issue.project ? issue.project.name : null;
  const state = issue.state ? issue.state.name : null;
  const meta = `${projectFull ? ` [${projectFull}]` : ''}${state ? ` (${state})` : ''}`;
  const project = projectFull ? projectFull.split(' ')[0] : null;

  return {
    name: `${description}${meta}`,
    short: issue.identifier,
    value: {
      description,
      project
    }
  };
};
