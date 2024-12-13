const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Get the WDOGE contract
  const WDOGE = await ethers.getContractFactory("WDOGE");
  const wdoge = WDOGE.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
  
  // Amount to mint (1000 WDOGE)
  const mintAmount = ethers.utils.parseEther("1000");
  
  // Mint to the deployer
  await wdoge.mint(deployer.address, mintAmount);
  console.log(`Minted 1000 WDOGE to ${deployer.address}`);
  
  // Get and log the new balance
  const balance = await wdoge.balanceOf(deployer.address);
  console.log(`New balance: ${ethers.utils.formatEther(balance)} WDOGE`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
