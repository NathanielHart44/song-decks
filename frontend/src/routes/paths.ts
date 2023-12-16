// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  resetPassRequest: path(ROOTS_AUTH, '/reset-request'),
  resetPassConfirm: path(ROOTS_AUTH, '/reset-confirm'),
};

export const PATH_PAGE = {
  workbench: '/workbench',
  landing: '/landing',
  home: '/home',
  game: '/game',
  manage: '/manage',
  moderator: '/moderator',
  select_deck: '/select-deck',
  page404: '/404',
};