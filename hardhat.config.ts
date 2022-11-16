require('@openzeppelin/hardhat-upgrades');

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const CHAIN_IDS = {
  hardhat: 31337,
}

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: CHAIN_IDS.hardhat,
      forking: {
        // Using Alchemy
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_TOKEN}`,
      },
    },
  },
  solidity: "0.8.17",
};

export default config;
