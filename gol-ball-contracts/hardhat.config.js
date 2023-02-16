// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.17",
// };


require("@nomicfoundation/hardhat-toolbox");

// require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.13',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        count: 50,
      },
      metaTx: {
        signer: process.env.FORWARDER_ADDRESS,
        // relayer: NETWORKS.META_TX_RELAYER,
        // domainSeparator: NETWORKS.META_TX_DOMAIN_SEPARATOR,
        forwarder: process.env.FORWARDER_ADDRESS,
      },      
      chainId: 31337,
      blockGasLimit: 30_000_000,
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI || '',
      accounts:
        process.env.PRIVATE_KEY_MUMBAI_6 !== undefined
          ? [process.env.PRIVATE_KEY_MUMBAI_6, process.env.PRIVATE_KEY_MUMBAI_2]
          : [],
    },
    polygon_mainnet: {
      url: process.env.POLYGON_MAINNET || '',
      accounts:
        process.env.PRIVATE_KEY_CONTRACT_OWNER_ACCOUNT !== undefined
          ? [process.env.PRIVATE_KEY_CONTRACT_OWNER_ACCOUNT]
          : [],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGON_SCAN_API_KEY || '',
  },
};
