import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "EncryptedCreditScore";

// <root>/backend
const rel = "../backend";

// <root>/frontend/abi
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    if (!optional) {
      console.error(
        `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    return undefined;
  }

  const deploymentFile = path.join(chainDeploymentDir, `${contractName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    if (!optional) {
      console.error(
        `${line}Unable to locate deployment file '${deploymentFile}'.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(deploymentFile, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Read deployments - automatically skip if not exists
const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true /* optional */);
const deployHardhat = readDeployment("hardhat", 31337, CONTRACT_NAME, true /* optional */);
const deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true /* optional */);

// Find the first available deployment to get ABI
let abiSource = deployLocalhost || deployHardhat || deploySepolia;
if (!abiSource) {
  console.error(
    `${line}No deployments found. Please deploy the contract first.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network <network>'.${line}`
  );
  process.exit(1);
}

// Verify all deployments have the same ABI
const deployments = [deployLocalhost, deployHardhat, deploySepolia].filter(d => d !== undefined);
if (deployments.length > 1) {
  const firstAbi = JSON.stringify(deployments[0].abi);
  for (let i = 1; i < deployments.length; i++) {
    if (JSON.stringify(deployments[i].abi) !== firstAbi) {
      console.warn(
        `${line}Warning: Deployments have different ABIs. Using ABI from first deployment.${line}`
      );
      break;
    }
  }
}

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: abiSource.abi }, null, 2)} as const;
\n`;

// Build addresses object dynamically
const addressesObj = {};
if (deploySepolia) {
  addressesObj["11155111"] = {
    address: deploySepolia.address,
    chainId: 11155111,
    chainName: "sepolia"
  };
}
if (deployHardhat) {
  addressesObj["31337"] = {
    address: deployHardhat.address,
    chainId: 31337,
    chainName: "hardhat"
  };
} else if (deployLocalhost) {
  addressesObj["31337"] = {
    address: deployLocalhost.address,
    chainId: 31337,
    chainName: "localhost"
  };
}

const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = ${JSON.stringify(addressesObj, null, 2)};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);
console.log(tsAddresses);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);

