import {
  getLinearIssue
} from './requests';

const getIssue = async(id) => {
  const response = await getLinearIssue(id).catch((res) => res);

  if (!response.ok) {
    return null;
  }

  const { issue } = response.data.data;

  return issue;
};

export default getIssue;
