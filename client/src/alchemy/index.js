// client/src/alchemy/index.js
import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: "fxRyRAmjnY4aaz4jgbmxIu-Uf3-36RVV", // Replace with your actual Alchemy API key
  network: Network.ETH_MAINNET, // You can change to GOERLI or SEPOLIA if needed
};

const alchemy = new Alchemy(settings);

export default alchemy;
