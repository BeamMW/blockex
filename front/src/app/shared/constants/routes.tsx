export const ROUTES = {
  MAIN: {
    BASE: '/',
    BLOCK: '/block/:height',
  },
  CONTRACTS: {
    BASE: '/contracts',
    CONTRACT: '/contract/:cid',
  },
  ASSETS: {
    BASE: '/assets',
    ASSET: '/asset/:aid',
  }
};

export const MENU_TABS_CONFIG = [
  {
    name: 'blocks',
    disabled: false,
    route: ROUTES.MAIN.BASE
  },
  {
    name: 'contracts',
    disabled: false,
    route: ROUTES.CONTRACTS.BASE
  },
  {
    name: 'dapps',
    disabled: true,
  },
  {
    name: 'assets',
    disabled: false,
  },
  {
    name: 'atomic swap offers',
    disabled: true,
  }
];