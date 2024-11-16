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
  // Check environment variables
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.error("DEPLOYER_PRIVATE_KEY not set in .env file");
    return;
  }
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  // get named accounts
  const { deployer } = await hre.getNamedAccounts();
  const signers = await hre.ethers.getSigners();
  const beneficiary1 = signers[1] ? signers[1].address : deployer;
  const beneficiary2 = signers[2] ? signers[2].address : deployer;
  
  // Log addresses for debugging
  console.log("Deployer address:", deployer);
  console.log("Beneficiary1 address:", beneficiary1);
  console.log("Beneficiary2 address:", beneficiary2);

  // Check if the deployer account is defined
  if (!deployer) {
    throw new Error("Deployer account not found");
  }

  const { deploy } = hre.deployments;

  // USDC token address for the sepolia network
  const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

  // beneficiaries and their shares
  const beneficiaries = [beneficiary1, beneficiary2];
  const shares = [475, 475];

  const feeData = await hre.ethers.provider.getFeeData();
  try {
    console.log({ feeData })
    await deploy("YouSplit", {
      from: deployer,
      // Contract constructor arguments
      args: [usdcAddress, beneficiaries, shares],
      log: true,
      // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
      // automatically mining the contract deployment transaction. There is no effect on live networks.
      autoMine: true,
      // gasLimit: 5000000, //set a high gas limit for testnet deployment
      maxFeePerGas: feeData.maxFeePerGas,
      // maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    });

    // Get the deployed contract to interact with it after deploying.
    const youSplit = await hre.ethers.getContract<Contract>("YouSplit", deployer);
    console.log("YouSplit Contract deployed successfully at:", youSplit.address);
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
};

export default deployYouSplit;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YouSplit
deployYouSplit.tags = ["YouSplit"];