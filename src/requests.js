import {
  createTogglApiRequest,
  createLinearApiRequest
} from './utils';

// Linear

export const getLinearUserInfo = async(apiKey) => {
  const result = await createLinearApiRequest(`
    query {
      viewer {
        id
        name
        email
      }
    }
  `, {
    apiKey
  });

  return result;
};

export const getLinearUserRecentIssues = async(id) => {
  const result = await createLinearApiRequest(`
    query User($id: String!) {
      user(id: $id) {
        assignedIssues(
          first: 10,
          orderBy: createdAt
        ) {
          nodes {
            title
            identifier
            project {
              id
              name
              color
            }
            state {
              name
              color
            }
          }
        }
      }
    }
  `, {
    variables: {
      id
    }
  });

  return result;
};

export const getLinearIssueSearch = async(query) => {
  const result = await createLinearApiRequest(`
    query IssueSearch($query: String!) {
      issueSearch(
        query: $query,
        includeArchived: true,
        first: 10
      ) {
        nodes {
          title
          identifier
          project {
            id
            name
            color
          }
          state {
            name
            color
          }
        }
      }
    }
  `, {
    variables: {
      query
    }
  });

  return result;
};

export const getLinearIssue = async(id) => {
  const result = await createLinearApiRequest(`
    query Issue($id: String!) {
      issue(
        id: $id
      ) {
        title
        identifier
        project {
          id
          name
          color
        }
        state {
          name
          color
        }
      }
    }
  `, {
    variables: {
      id
    }
  });

  return result;
};

// Toggl

export const getTogglUserInfo = async(token) => {
  const result = await createTogglApiRequest('/me?with_related_data=1', { token });

  return result;
};

export const getTogglWorkspaceProjectList = async(wid) => {
  const result = await createTogglApiRequest(`/workspaces/${wid}/projects`);

  return result;
};

export const postTogglTimeEntryStart = async(description, wid, pid) => {
  const result = await createTogglApiRequest('/time_entries/start', {
    method: 'POST',
    sendData: {
      time_entry: {
        description,
        wid,
        pid,
        created_with: 'togglinear'
      }
    }
  });

  return result;
};
