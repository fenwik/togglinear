import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';

import {
  getLinearUserInfo,
  getLinearUserRecentIssues,
  getLinearIssueSearch
} from './requests';
import {
  buildIssueChoiseItem,
  requestErrorHandler
} from './utils';

inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

const searchIssue = async() => {
  const viewer = await getLinearUserInfo()
    .then(({ data }) => data.data.viewer)
    .catch(requestErrorHandler);
  const defaultIssues = await getLinearUserRecentIssues(viewer.id)
    .then(({ data }) => data.data.user.assignedIssues.nodes)
    .then((list) => list.map(buildIssueChoiseItem))
    .catch(requestErrorHandler);

  const { issue } = await inquirer.prompt({
    type: 'autocomplete',
    name: 'issue',
    message: 'Search issues',
    suggestOnly: false,
    pageSize: 10,
    validate: (value) => !!value || 'Type something!',
    source: async(answersSoFar, input) => {
      if (!input) {
        return defaultIssues;
      }

      const { data } = await getLinearIssueSearch(input).catch(requestErrorHandler);
      const issues = data.data.issueSearch.nodes.map(buildIssueChoiseItem);

      return issues;
    }
  });

  return issue;
};

export default searchIssue;
