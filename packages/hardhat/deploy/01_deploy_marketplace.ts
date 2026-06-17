import { deployScript, artifacts } from "../rocketh/deploy.js";

/**
 * Deploys the MyNFT and Marketplace contracts
 *
 * @param env Rocketh environment object.
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const myNft = await env.deploy("MyNFT", {
      account: deployer,
      artifact: artifacts.MyNFT,
      // Contract constructor arguments
      args: [deployer],
    });
    console.log("MyNFT deployed at:", myNft.address);

    const marketplace = await env.deploy("Marketplace", {
      account: deployer,
      artifact: artifacts.Marketplace,
      // Contract constructor arguments
      args: [deployer],
    });
    console.log("Marketplace deployed at:", marketplace.address);
  },
  {
    tags: ["MyNFT", "Marketplace"],
  },
);
