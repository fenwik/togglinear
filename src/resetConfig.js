import { promises as fs } from 'fs';

import { configPath } from './utils';

const resetConfig = () => fs.rmdir(
  configPath,
  {
    recursive: true
  }
);

export default resetConfig;
