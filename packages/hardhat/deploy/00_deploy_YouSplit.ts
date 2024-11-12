import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YouSplit" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYouSplit: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Example of beneficiaries and their share percentages
  // Note: The shares should add up to 9500 (95%) when considering all beneficiaries combined. 
  const signers = await hre.ethers.getSigners();
  const beneficiary1 = signers[1];
  const beneficiary2 = signers[2];

  const beneficiaries = [beneficiary1.address, beneficiary2.address];
  // we assume each beneficiary gets an equal share of the remaining 95% after the owner's 5%
  const shares =[475, 475];

  await deploy("YouSplit", {
    from: deployer,
    // Contract constructor arguments
    args: [beneficiaries, shares],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const youSplit = await hre.ethers.getContract<Contract>("YouSplit", deployer);
  console.log("YouSplit Contract deployed successfully");
};

export default deployYouSplit;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YouSplit
deployYouSplit.tags = ["YouSplit"];
