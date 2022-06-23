import { actionProcedure } from './action-procedure';
import { profileProcedure } from './profile-procedure';
import { searchProcedure } from './search-procedure';
import { videosProcedure } from './video-procedure';

const deserializeMapping = {
  video: videosProcedure,
  profile: profileProcedure,
  search: searchProcedure,
  action: actionProcedure,
};

export { deserializeMapping };
