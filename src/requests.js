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
              name
            }
            state {
              name
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
            name
          }
          state {
            name
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

// Toggl

export const getTogglUserInfo = async(token) => {
  const result = await createTogglApiRequest('/me?with_related_data=1', { token });

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
