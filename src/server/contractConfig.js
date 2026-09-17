const RPC_URL = process.env.RPC_URL || 'https://ethereum.publicnode.com';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)'
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const SECOND_CONTRACT_ADDRESS = process.env.SECOND_CONTRACT_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

module.exports = {
  RPC_URL,
  CONTRACT_ADDRESS,
  CONTRACT_ABI: ERC20_ABI,
  SECOND_CONTRACT_ADDRESS,
  SECOND_CONTRACT_ABI: ERC20_ABI,
  PUBLIC_WETH_ADDRESS: CONTRACT_ADDRESS,
  PUBLIC_USDC_ADDRESS: SECOND_CONTRACT_ADDRESS,
  CHAINLINK_ETH_USD_ADDRESS: process.env.CHAINLINK_ETH_USD_ADDRESS || '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  CHAINLINK_ETH_USD_ABI: [
    'function decimals() view returns (uint8)',
    'function description() view returns (string)',
    'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
  ]
};
