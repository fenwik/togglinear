import {
  getTogglUserInfo,
  postTogglTimeEntryStart
} from './requests';
import {
  getPid
} from './utils';

const startTimeEntry = async(issue) => {
  const getUser = await getTogglUserInfo();

  if (!getUser.ok || !getUser.data || !getUser.data.data) {
    throw new Error('`getTogglUserInfo` request failed');
  }

  const togglUserData = getUser.data.data;
  const pid = await getPid(issue.project, togglUserData.projects);

  const createTimeEntryStart = await postTogglTimeEntryStart(
    issue.description,
    togglUserData.default_wid,
    pid
  );

  if (!createTimeEntryStart.ok) {
    throw new Error('`postTogglTimeEntryStart` request failed');
  }

  return createTimeEntryStart.data;
};

export default startTimeEntry;
