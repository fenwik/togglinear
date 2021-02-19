import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';

import {
  getLinearUserInfo,
  getLinearUserRecentIssues,
  getLinearIssueSearch
} from './requests';
import {
  buildIssueChoiceItem,
  requestErrorHandler
} from './utils';

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

let timeout = null;
const debounceValue = async(value) => new Promise((resolve) => {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    resolve(value);
  }, 400);
});

const searchIssue = async() => {
  const viewer = await getLinearUserInfo()
    .then(({ data }) => data.data.viewer)
    .catch(requestErrorHandler);
  const defaultIssues = await getLinearUserRecentIssues(viewer.id)
    .then(({ data }) => data.data.user.assignedIssues.nodes)
    .then((list) => list.map(buildIssueChoiceItem))
    .catch(requestErrorHandler);

  const { issue } = await inquirer.prompt({
    type: 'autocomplete',
    name: 'issue',
    message: 'Search issue',
    suggestOnly: false,
    pageSize: 10,
    validate: (value) => !!value || 'Type something!',
    source: async(_, input) => {
      if (!input) {
        return defaultIssues;
      }

      const value = await debounceValue(input);
      const { data } = await getLinearIssueSearch(value).catch(requestErrorHandler);
      const issues = data.data.issueSearch.nodes.map(buildIssueChoiceItem);

      return issues;
    }
  });

  return issue;
};

export default searchIssue;
