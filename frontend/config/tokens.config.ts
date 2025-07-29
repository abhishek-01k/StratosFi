export const CHAIN_IDS = {
    ETHEREUM: 1,
    BASE: 8453,
    POLYGON: 137,
};

type Token = {
    name: string;
    symbol: string;
    address: string;
    logo: string;
};

export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
    [CHAIN_IDS.ETHEREUM]: [
        {
            name: "Wrapped Ether",
            symbol: "WETH",
            address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            logo: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
        },
        {
            name: "BNB",
            symbol: "BNB",
            address: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
            logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
        },
        {
            name: "1INCH Token",
            symbol: "1INCH",
            address: "0x111111111117dc0aa78b770fa6a738034120c302",
            logo: "https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png",
        },
        {
            name: "USD Coin",
            symbol: "USDC",
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
        },
        {
            name: "Tether USD",
            symbol: "USDT",
            address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
            logo: "https://tokens-data.1inch.io/images/1/0xdac17f958d2ee523a2206206994597c13d831ec7_0xc047483b8988ef2766792d8bfc95e22756b57c1fd130c69035645f15c6c31a09.webp",
        },
    ],
    [CHAIN_IDS.BASE]: [
        {
            name: 'Ethereum',
            symbol: 'ETH',
            logo: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628',
            address: '0x4200000000000000000000000000000000000006',
        },
        {
            name: 'Tether USD',
            symbol: 'USDT',
            logo: 'https://tokens-data.1inch.io/images/1/0xdac17f958d2ee523a2206206994597c13d831ec7_0xc047483b8988ef2766792d8bfc95e22756b57c1fd130c69035645f15c6c31a09.webp',
            address: '0x...BASE_USDT_ADDRESS',
        },
        {
            name: 'USD Coin',
            symbol: 'USDC',
            logo: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
            address: '0x...BASE_USDT_ADDRESS',
        },
    ],
    [CHAIN_IDS.POLYGON]: [
        {
            name: 'Ethereum',
            symbol: 'ETH',
            logo: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628',
            address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        },
        {
            name: 'Tether USD',
            symbol: 'USDT',
            logo: 'https://tokens-data.1inch.io/images/1/0xdac17f958d2ee523a2206206994597c13d831ec7_0xc047483b8988ef2766792d8bfc95e22756b57c1fd130c69035645f15c6c31a09.webp',
            address: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
        },
        {
            name: 'USD Coin',
            symbol: 'USDC',
            logo: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
            address: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
        },
    ]
};