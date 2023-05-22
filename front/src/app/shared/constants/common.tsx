export const GROTHS_IN_BEAM = 100000000;
export const BEAMX_TVL = 100000000;
export const BEAMX_TVL_STR = '100 000 000';

export const ethId = 4;
export const ETH_RATE_ID = 'ethereum';

export const MAX_ALLOWED_VALUE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const REVOKE_VALUE = '0';

export const CURRENCIES = [
    {
        name: "USDT",
        rate_id: 'tether',
        id: 1,
        decimals: 6,
        validator_dec: 6,
        ethTokenContract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        ethPipeContract: '0x7C3Fe09E86b0d8661d261a49Bfa385536b7077f9',       
    },
    {
        name:'WBTC',
        rate_id: 'wrapped-bitcoin',
        id: 2,
        decimals: 8,
        validator_dec: 6,
        ethTokenContract: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        ethPipeContract: '0x604422D7eC88c45b82B71851d073eFeaA928dcEF',
    },
    {
        name:'DAI',
        rate_id: 'dai',
        id: 3,
        decimals: 18,
        validator_dec: 8,
        ethTokenContract: '0x6b175474e89094c44da98b954eedeac495271d0f',
        ethPipeContract: '0xAcDc8f4559741a3c8CAAB0ba74c57807A9Fe2d73',
    },
    {
        name: 'ETH',
        rate_id: 'ethereum',
        id: ethId,
        decimals: 18,
        validator_dec: 8,
        ethTokenContract: '',
        ethPipeContract: '0xB1d7FF9D3aCaf30e282c5F6eb1F2A6503f516a96',
    }
];