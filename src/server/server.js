require('dotenv').config();

const express = require('express');
const { ethers } = require('ethers');
const {
  RPC_URL,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  SECOND_CONTRACT_ADDRESS,
  SECOND_CONTRACT_ABI,
  PUBLIC_WETH_ADDRESS,
  PUBLIC_USDC_ADDRESS,
  CHAINLINK_ETH_USD_ADDRESS,
  CHAINLINK_ETH_USD_ABI
} = require('./contractConfig');

const app = express();
const PORT = process.env.PORT || 3010;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
const secondContract = new ethers.Contract(SECOND_CONTRACT_ADDRESS, SECOND_CONTRACT_ABI, provider);
const chainlinkEthUsd = new ethers.Contract(CHAINLINK_ETH_USD_ADDRESS, CHAINLINK_ETH_USD_ABI, provider);

app.get('/contract', async (req, res) => {
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();

    const result = {
      contractAddress: CONTRACT_ADDRESS,
      name,
      symbol,
      totalSupply: ethers.utils.formatUnits(totalSupply, 18),
      rawTotalSupply: totalSupply.toString()
    };

    console.log('Smart contract data:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching contract data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/second-contract', async (req, res) => {
  try {
    const name = await secondContract.name();
    const symbol = await secondContract.symbol();
    const decimals = await secondContract.decimals();
    const totalSupply = await secondContract.totalSupply();

    const result = {
      contractAddress: SECOND_CONTRACT_ADDRESS,
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      rawTotalSupply: totalSupply.toString()
    };

    console.log('Second contract data:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching second contract data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/third-contract', async (req, res) => {
  try {
    const [description, decimals, roundData] = await Promise.all([
      chainlinkEthUsd.description(),
      chainlinkEthUsd.decimals(),
      chainlinkEthUsd.latestRoundData()
    ]);
    const answer = roundData.answer;

    const result = {
      contractAddress: CHAINLINK_ETH_USD_ADDRESS,
      description,
      roundId: roundData.roundId.toString(),
      price: ethers.utils.formatUnits(answer, decimals),
      updatedAt: new Date(roundData.updatedAt.toNumber() * 1000).toISOString(),
      rawAnswer: answer.toString()
    };

    console.log('Chainlink price feed data:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching Chainlink data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/FardeenApiTest', async (req, res) => {
  try {
    const [name, symbol, decimals, totalSupply, blockNumber] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      provider.getBlockNumber()
    ]);

    const result = {
      contractAddress: PUBLIC_WETH_ADDRESS,
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      blockNumber,
      source: 'Ethereum mainnet public WETH contract'
    };

    console.log('Fardeen API test data:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching Fardeen API test data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/public-weth/balance', async (req, res) => {
  try {
    const wallet = req.query.address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    if (!ethers.utils.isAddress(wallet)) {
      return res.status(400).json({ error: 'Query parameter address must be a valid Ethereum address' });
    }

    const weth = new ethers.Contract(PUBLIC_WETH_ADDRESS, CONTRACT_ABI, provider);
    const [balance, decimals, symbol] = await Promise.all([
      weth.balanceOf(wallet),
      weth.decimals(),
      weth.symbol()
    ]);

    res.json({
      contractAddress: PUBLIC_WETH_ADDRESS,
      address: wallet,
      token: symbol,
      balance: ethers.utils.formatUnits(balance, decimals),
      rawBalance: balance.toString()
    });
  } catch (error) {
    console.error('Error fetching public WETH balance:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/public-usdc/supply', async (req, res) => {
  try {
    const usdc = new ethers.Contract(PUBLIC_USDC_ADDRESS, SECOND_CONTRACT_ABI, provider);
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      usdc.name(),
      usdc.symbol(),
      usdc.decimals(),
      usdc.totalSupply()
    ]);

    res.json({
      contractAddress: PUBLIC_USDC_ADDRESS,
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      rawTotalSupply: totalSupply.toString()
    });
  } catch (error) {
    console.error('Error fetching public USDC supply:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/all', async (req, res) => {
  try {
    const wallet = req.query.address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    if (!ethers.utils.isAddress(wallet)) {
      return res.status(400).json({ error: 'Query parameter address must be a valid Ethereum address' });
    }

    const weth = new ethers.Contract(PUBLIC_WETH_ADDRESS, CONTRACT_ABI, provider);
    const usdc = new ethers.Contract(PUBLIC_USDC_ADDRESS, SECOND_CONTRACT_ABI, provider);
    const [
      contractName,
      contractSymbol,
      contractSupply,
      secondName,
      secondSymbol,
      secondDecimals,
      secondSupply,
      priceDescription,
      priceDecimals,
      roundData,
      wethDecimals,
      wethSymbol,
      wethBalance,
      usdcName,
      usdcSymbol,
      usdcDecimals,
      usdcSupply,
      blockNumber
    ] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
      secondContract.name(),
      secondContract.symbol(),
      secondContract.decimals(),
      secondContract.totalSupply(),
      chainlinkEthUsd.description(),
      chainlinkEthUsd.decimals(),
      chainlinkEthUsd.latestRoundData(),
      weth.decimals(),
      weth.symbol(),
      weth.balanceOf(wallet),
      usdc.name(),
      usdc.symbol(),
      usdc.decimals(),
      usdc.totalSupply(),
      provider.getBlockNumber()
    ]);

    res.json({
      contract: {
        contractAddress: CONTRACT_ADDRESS,
        name: contractName,
        symbol: contractSymbol,
        totalSupply: ethers.utils.formatUnits(contractSupply, 18),
        rawTotalSupply: contractSupply.toString()
      },
      secondContract: {
        contractAddress: SECOND_CONTRACT_ADDRESS,
        name: secondName,
        symbol: secondSymbol,
        decimals: secondDecimals,
        totalSupply: ethers.utils.formatUnits(secondSupply, secondDecimals),
        rawTotalSupply: secondSupply.toString()
      },
      chainlink: {
        contractAddress: CHAINLINK_ETH_USD_ADDRESS,
        description: priceDescription,
        roundId: roundData.roundId.toString(),
        price: ethers.utils.formatUnits(roundData.answer, priceDecimals),
        updatedAt: new Date(roundData.updatedAt.toNumber() * 1000).toISOString(),
        rawAnswer: roundData.answer.toString()
      },
      wethTest: {
        contractAddress: PUBLIC_WETH_ADDRESS,
        name: contractName,
        symbol: contractSymbol,
        decimals: wethDecimals,
        totalSupply: ethers.utils.formatUnits(contractSupply, wethDecimals),
        blockNumber,
        source: 'Ethereum mainnet public WETH contract'
      },
      wethBalance: {
        contractAddress: PUBLIC_WETH_ADDRESS,
        address: wallet,
        token: wethSymbol,
        balance: ethers.utils.formatUnits(wethBalance, wethDecimals),
        rawBalance: wethBalance.toString()
      },
      usdcSupply: {
        contractAddress: PUBLIC_USDC_ADDRESS,
        name: usdcName,
        symbol: usdcSymbol,
        decimals: usdcDecimals,
        totalSupply: ethers.utils.formatUnits(usdcSupply, usdcDecimals),
        rawTotalSupply: usdcSupply.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching all API data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Using contract: ${CONTRACT_ADDRESS}`);
});

module.exports = app;


