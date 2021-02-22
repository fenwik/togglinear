import {
  getLinearIssue
} from './requests';
import {
  processIssue
} from './utils';

const getIssue = async(id) => {
  const response = await getLinearIssue(id).catch((res) => res);

  if (!response.ok) {
    return null;
  }

  const issue = processIssue(response.data.data.issue);

  return issue;
};

export default getIssue;
