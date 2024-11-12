import { expect } from "chai";
import { ethers } from "hardhat";
import { YouSplit } from "../typechain-types/YouSplit";
import { YouSplit__factory } from "../typechain-types/factories/YouSplit__factory";

describe("YouSplit", function () {
  let youSplit: YouSplit;
  let owner: any;
  let beneficiary1: any;
  let beneficiary2: any;
  
  before(async () => {
    // signers for different roles in the contract
    const signers = await ethers.getSigners();
    owner = signers[0];
    beneficiary1 = signers[1];
    beneficiary2 = signers[2];

    // deploy the contract
    const youSplitFactory = await ethers.getContractFactory("YouSplit");
    youSplit = await youSplitFactory.deploy([beneficiary1.address, beneficiary2.address],[475, 475]);
    await youSplit.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await youSplit.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct share distribution", async function () {
      // Check owner shares
      const { shares: ownerShares } = await youSplit.beneficiaries(owner.address);
      expect(ownerShares).to.equal(5); // Owner should have 5% of shares

      // Check beneficiary shares
      const { shares: beneficiary1Shares } = await youSplit.beneficiaries(beneficiary1.address);
      expect(beneficiary1Shares).to.equal(475); // 95% / 2 = 47.5% (represented as 475 out of 10000)

      const { shares: beneficiary2Shares } = await youSplit.beneficiaries(beneficiary2.address);
      expect(beneficiary2Shares).to.equal(475);
    });

    it("Should start with zero withdrawn for all beneficiaries", async function () {
      expect((await youSplit.beneficiaries(owner.address)).withdrawn).to.equal(0);
      expect((await youSplit.beneficiaries(beneficiary1.address)).withdrawn).to.equal(0);
      expect((await youSplit.beneficiaries(beneficiary2.address)).withdrawn).to.equal(0);
    });

    it("Should set all beneficiaries as eligible", async function () {
      expect((await youSplit.beneficiaries(owner.address)).isEligible).to.equal(true);
      expect((await youSplit.beneficiaries(beneficiary1.address)).isEligible).to.equal(true);
      expect((await youSplit.beneficiaries(beneficiary2.address)).isEligible).to.equal(true);
    });

    it("Should start with zero balance", async function () {
      expect(await youSplit.totalBalance()).to.equal(0);
    });

    it("Should allow funds to be sent to the contract", async function () {
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({ to: await youSplit.getAddress(), value: amount });

      expect(await youSplit.totalBalance()).to.equal(amount);
    });

    it("Should allow beneficiaries to withdraw their funds", async function () {
      const initialBalance = await ethers.provider.getBalance(beneficiary1.address);
      await youSplit.connect(beneficiary1).withdraw();
      const afterWithdrawBalance = await ethers.provider.getBalance(beneficiary1.address);
      
      // Check if balance increased after withdrawal
      expect(afterWithdrawBalance > initialBalance).to.be.true;

      // Check the withdrawn amount for beneficiary1
      const { withdrawn: withdrawnAmount } = await youSplit.beneficiaries(beneficiary1.address);
      expect(withdrawnAmount).to.be.gt(0);
    });

    it("Should not allow non-eligible beneficiaries to withdraw", async function () {
      await youSplit.setBeneficiary(beneficiary2.address, 0, false);  // Make beneficiary2 ineligible
      await expect(youSplit.connect(beneficiary2).withdraw()).to.be.revertedWith("You are not eligible to withdraw.");
    });
  });
});
