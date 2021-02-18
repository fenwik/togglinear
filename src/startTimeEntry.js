import {
  getTogglUserInfo,
  postTogglTimeEntryStart
} from './requests';

const startTimeEntry = async(issue) => {
  const getUser = await getTogglUserInfo();

  if (!getUser.ok || !getUser.data || !getUser.data.data) {
    throw new Error('`getTogglUserInfo` request failed');
  }

  const {
    description
  } = issue;
  const {
    projects,
    default_wid: wid
  } = getUser.data.data;
  const project = projects.find(({ name }) => name === issue.project);
  const pid = project ? project.id : null;

  const createTimeEntryStart = await postTogglTimeEntryStart(description, wid, pid);

  if (!createTimeEntryStart.ok) {
    throw new Error('`postTogglTimeEntryStart` request failed');
  }

  return createTimeEntryStart.data;
};

export default startTimeEntry;
