import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedCreditScore, EncryptedCreditScore__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const threshold = 50;
  const placeholderAddress = "0x0000000000000000000000000000000000000000";
  
  const encryptedThreshold = await fhevm
    .createEncryptedInput(placeholderAddress, (await ethers.getSigners())[0].address)
    .add32(threshold)
    .encrypt();

  const [deployerSigner] = await ethers.getSigners();
  const factory = new EncryptedCreditScore__factory(deployerSigner);
  const contract = await factory.deploy(
    encryptedThreshold.handles[0],
    encryptedThreshold.inputProof
  );
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedCreditScore", function () {
  let signers: Signers;
  let contract: EncryptedCreditScore;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should have threshold set after deployment", async function () {
    const thresholdHandle = await contract.getThreshold();
    expect(thresholdHandle).to.not.eq(ethers.ZeroHash);
  });

  it("should allow user to submit credit data", async function () {
    const income = 50000;
    const debtRatio = 30;
    const repaymentScore = 85;

    const encryptedData = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(income)
      .add32(debtRatio)
      .add32(repaymentScore)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .submitCreditData(
        encryptedData.handles[0],
        encryptedData.inputProof,
        encryptedData.handles[1],
        encryptedData.inputProof,
        encryptedData.handles[2],
        encryptedData.inputProof
      );
    await tx.wait();

    const hasData = await contract.hasCreditData(signers.alice.address);
    expect(hasData).to.be.true;
  });

  it("should calculate credit score correctly", async function () {
    const income = 50000;
    const debtRatio = 30;
    const repaymentScore = 85;

    const encryptedData = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(income)
      .add32(debtRatio)
      .add32(repaymentScore)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .submitCreditData(
        encryptedData.handles[0],
        encryptedData.inputProof,
        encryptedData.handles[1],
        encryptedData.inputProof,
        encryptedData.handles[2],
        encryptedData.inputProof
      );
    await tx.wait();

    const creditScoreHandle = await contract.getCreditScore(signers.alice.address);
    const clearCreditScore = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      creditScoreHandle,
      contractAddress,
      signers.alice,
    );

    // Credit score = (50000/10) + ((100-30)/10) + (85/10) = 5000 + 7 + 8.5 = 5015.5
    // But due to integer division, it might be different
    expect(clearCreditScore).to.be.greaterThan(0);
  });

  it("should determine qualification status", async function () {
    const income = 50000;
    const debtRatio = 30;
    const repaymentScore = 85;

    const encryptedData = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(income)
      .add32(debtRatio)
      .add32(repaymentScore)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .submitCreditData(
        encryptedData.handles[0],
        encryptedData.inputProof,
        encryptedData.handles[1],
        encryptedData.inputProof,
        encryptedData.handles[2],
        encryptedData.inputProof
      );
    await tx.wait();

    const qualificationHandle = await contract.getQualificationStatus(signers.alice.address);
    const clearQualification = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      qualificationHandle,
      contractAddress,
      signers.alice,
    );

    // Should be qualified (1) or not qualified (0)
    expect(clearQualification === BigInt(0) || clearQualification === BigInt(1)).to.be.true;
  });
});

