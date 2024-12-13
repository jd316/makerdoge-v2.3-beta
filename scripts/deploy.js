const hre = require("hardhat");
const { updateFrontendConfig } = require('./update-frontend-config');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Mock Price Feed
  console.log("Deploying Mock Price Feed...");
  const MockPriceFeed = await hre.ethers.getContractFactory("MockPriceFeed");
  const priceFeed = await MockPriceFeed.deploy();
  await priceFeed.deployed();
  console.log("Mock Price Feed deployed to:", priceFeed.address);

  // Set initial price ($0.40 with 18 decimals)
  const price = ethers.utils.parseUnits("0.40", 18);
  await priceFeed.setPrice(price);
  console.log("Set initial DOGE price to $0.40");

  // Deploy WDOGE
  console.log("Deploying WDOGE...");
  const WDOGE = await hre.ethers.getContractFactory("WDOGE");
  const wdoge = await WDOGE.deploy();
  await wdoge.deployed();
  console.log("WDOGE deployed to:", wdoge.address);

  // Mint WDOGE to deployer and additional address for testing
  const mintAmount = ethers.utils.parseEther("1000");
  await wdoge.mint(deployer.address, mintAmount);
  console.log("Minted 1000 WDOGE to:", deployer.address);
  
  // Mint to test account
  const testAccount = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
  await wdoge.mint(testAccount, mintAmount);
  console.log("Minted 1000 WDOGE to:", testAccount);

  // Deploy DogeMakerVault
  console.log("Deploying DogeMakerVault...");
  const DogeMakerVault = await hre.ethers.getContractFactory("DogeMakerVault");
  const vault = await DogeMakerVault.deploy(wdoge.address, priceFeed.address);
  await vault.deployed();
  console.log("DogeMakerVault deployed to:", vault.address);

  // Get USDm address
  const usdmAddress = await vault.usdm();
  console.log("USDm deployed to:", usdmAddress);

  // Update frontend config
  const addresses = {
    WDOGE: wdoge.address,
    USDm: usdmAddress,
    VAULT: vault.address,
    PRICE_FEED: priceFeed.address
  };
  
  await updateFrontendConfig(addresses);
  
  console.log("\nDeployment complete!");
  console.log("Deployment addresses on Local Network:");
  console.log("Mock Price Feed:", priceFeed.address);
  console.log("WDOGE:", wdoge.address);
  console.log("USDm:", usdmAddress);
  console.log("DogeMakerVault:", vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
