import { ethers, fhevm } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Credit score threshold: 50 (minimum score required for loan qualification)
  const threshold = 50;

  // Check if running on FHEVM mock environment or real Sepolia network
  const isRealNetwork = hre.network.name === "sepolia" && !fhevm.isMock;
  
  let encryptedThreshold;
  if (isRealNetwork) {
    // On real Sepolia, the Hardhat FHEVM plugin is not initialized.
    // Deploy the contract with a default internal threshold (constructor handles empty proof),
    // and update it later via setThreshold using Relayer-generated inputs from the frontend/tooling.
    console.log("Deploying to real Sepolia network with default internal threshold. You can update it later via setThreshold().");
    const dummyHandle = ethers.ZeroHash; // bytes32(0)
    const dummyProof = "0x"; // empty bytes triggers default threshold path in constructor
    encryptedThreshold = { handles: [dummyHandle], inputProof: dummyProof } as any;
  } else if (!fhevm.isMock) {
    console.warn("This deployment requires FHEVM mock environment or Sepolia network. Use hardhat network or deploy to Sepolia with FHEVM support.");
    return;
  } else {
    // Mock environment (hardhat/anvil)
    const placeholderAddress = "0x0000000000000000000000000000000000000000";
    encryptedThreshold = await fhevm
      .createEncryptedInput(placeholderAddress, deployer)
      .add32(threshold)
      .encrypt();
  }

  const deployedContract = await deploy("EncryptedCreditScore", {
    from: deployer,
    args: [encryptedThreshold.handles[0], encryptedThreshold.inputProof],
    log: true,
  });

  console.log(`EncryptedCreditScore contract deployed at: ${deployedContract.address}`);
  console.log(`Credit score threshold: ${threshold} (encrypted)`);
};

export default func;
func.id = "deploy_encryptedCreditScore";
func.tags = ["EncryptedCreditScore"];

