require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/fxRyRAmjnY4aaz4jgbmxIu-Uf3-36RVV',
      accounts: ['3b0815e132498eb8d5cc66441f07f706cef331265723701e43fc24aaea47ff32'],
    },
  },
};