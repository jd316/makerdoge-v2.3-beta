const { expect } = require("chai").use(require("chai-as-promised"));
const { ethers } = require("hardhat");

describe("DogeMakerVault", function () {
  let wdoge, vault, usdm, priceFeed;
  let owner, user;
  const INITIAL_WDOGE_AMOUNT = ethers.utils.parseEther("1000");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const WDOGE = await ethers.getContractFactory("WDOGE");
    wdoge = await WDOGE.deploy();
    await wdoge.deployed();

    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    priceFeed = await MockPriceFeed.deploy();
    await priceFeed.deployed();

    const DogeMakerVault = await ethers.getContractFactory("DogeMakerVault");
    vault = await DogeMakerVault.deploy(wdoge.address, priceFeed.address);
    await vault.deployed();

    const usdmAddress = await vault.usdm();
    usdm = await ethers.getContractAt("USDm", usdmAddress);

    // Mint some WDOGE to user
    await wdoge.mint(user.address, INITIAL_WDOGE_AMOUNT);
  });

  describe("Basic Operations", function () {
    it("Should allow deposits", async function () {
      const depositAmount = ethers.utils.parseEther("100");
      await wdoge.connect(user).approve(vault.address, depositAmount);
      await vault.connect(user).deposit(depositAmount);

      const userVault = await vault.getVaultInfo(user.address);
      expect(userVault.collateral.toString()).to.equal(depositAmount.toString());
    });

    it("Should allow borrowing within collateral ratio", async function () {
      const depositAmount = ethers.utils.parseEther("100"); // 100 DOGE
      // With price at $0.10, collateral value is $10
      // Max borrow should be (10 * 100) / 150 = $6.67 worth of USDm
      const borrowAmount = ethers.utils.parseEther("5"); // Borrow $5 worth of USDm (safe amount)

      await wdoge.connect(user).approve(vault.address, depositAmount);
      await vault.connect(user).deposit(depositAmount);
      await vault.connect(user).borrow(borrowAmount);

      const userVaultAfterBorrow = await vault.getVaultInfo(user.address);
      expect(userVaultAfterBorrow.debt.toString()).to.equal(borrowAmount.toString());
    });

    it("Should prevent borrowing above collateral ratio", async function () {
      const depositAmount = ethers.utils.parseEther("100");  // 100 DOGE
      // With price at $0.10, collateral value is $10
      // Max borrow should be (10 * 100) / 150 = $6.67 worth of USDm
      const borrowAmountExceed = ethers.utils.parseEther("8");  // Try to borrow $8 worth of USDm

      await wdoge.connect(user).approve(vault.address, depositAmount);
      await vault.connect(user).deposit(depositAmount);
      
      try {
        await vault.connect(user).borrow(borrowAmountExceed);
        assert.fail("Expected transaction to revert");
      } catch (error) {
        expect(error.message).to.include("Insufficient collateral");
      }
    });
  });
});
