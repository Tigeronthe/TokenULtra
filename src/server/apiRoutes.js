const { ethers } = require('ethers');

function registerApiRoutes(app, {
  provider,
  contract,
  secondContract,
  chainlinkEthUsd,
  contractAddress,
  secondContractAddress,
  publicWethAddress,
  publicUsdcAddress,
  contractAbi,
  secondContractAbi,
  chainlinkEthUsdAddress
}) {
  app.get('/contract', async (req, res) => {
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();

      res.json({
        contractAddress,
        name,
        symbol,
        totalSupply: ethers.utils.formatUnits(totalSupply, 18),
        rawTotalSupply: totalSupply.toString()
      });
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

      res.json({
        contractAddress: secondContractAddress,
        name,
        symbol,
        decimals,
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
        rawTotalSupply: totalSupply.toString()
      });
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

      res.json({
        contractAddress: chainlinkEthUsdAddress,
        description,
        roundId: roundData.roundId.toString(),
        price: ethers.utils.formatUnits(answer, decimals),
        updatedAt: new Date(roundData.updatedAt.toNumber() * 1000).toISOString(),
        rawAnswer: answer.toString()
      });
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

      res.json({
        contractAddress: publicWethAddress,
        name,
        symbol,
        decimals,
        totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
        blockNumber,
        source: 'Ethereum mainnet public WETH contract'
      });
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

      const weth = new ethers.Contract(publicWethAddress, contractAbi, provider);
      const [balance, decimals, symbol] = await Promise.all([
        weth.balanceOf(wallet),
        weth.decimals(),
        weth.symbol()
      ]);

      res.json({
        contractAddress: publicWethAddress,
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
      const usdc = new ethers.Contract(publicUsdcAddress, secondContractAbi, provider);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        usdc.name(),
        usdc.symbol(),
        usdc.decimals(),
        usdc.totalSupply()
      ]);

      res.json({
        contractAddress: publicUsdcAddress,
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
}

module.exports = { registerApiRoutes };
