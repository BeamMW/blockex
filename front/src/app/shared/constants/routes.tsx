export const ROUTES = {
  MAIN: {
    BASE: '/',
    BLOCK: '/block/:hash',
  },
  CONTRACTS: {
    BASE: '/contracts',
    CONTRACT: '/contract/:cid',
  },
  ASSETS: {
    BASE: '/assets',
    ASSET: '/asset/:aid',
  },
  DAPPS: {
    BASE: '/dapps',
    DAPP: '/dapp/:id',
  },
  SWAPS: {
    BASE: '/swaps',
  }
};

export const MENU_TABS_CONFIG = [
  {
    name: 'blocks',
    disabled: false,
    route: ROUTES.MAIN.BASE,
  },
  {
    name: 'contracts',
    disabled: false,
    route: ROUTES.CONTRACTS.BASE,
  },
  {
    name: 'dapps',
    disabled: true,
  },
  {
    name: 'assets',
    disabled: false,
    route: ROUTES.ASSETS.BASE,
  },
  {
    name: 'atomic swap offers',
    disabled: true,
  }
];