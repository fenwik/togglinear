import {
  getTogglUserInfo,
  getTogglWorkspaceProjectList,
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

  const { default_wid: wid } = getUser.data.data;

  const getProjects = await getTogglWorkspaceProjectList(wid);

  if (!getProjects.ok) {
    throw new Error('`getTogglWorkspaceProjectList` request failed');
  }

  const projects = getProjects.data;
  const pid = await getPid(issue.project, projects);

  const createTimeEntryStart = await postTogglTimeEntryStart(
    issue.description,
    wid,
    pid
  );

  if (!createTimeEntryStart.ok) {
    throw new Error('`postTogglTimeEntryStart` request failed');
  }

  const project = projects.find(({ id }) => id === pid) || null;

  return [
    createTimeEntryStart.data,
    project
  ];
};

export default startTimeEntry;
