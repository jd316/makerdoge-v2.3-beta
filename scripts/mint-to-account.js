const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Get the WDOGE contract
  const WDOGE = await ethers.getContractFactory("WDOGE");
  const wdoge = WDOGE.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
  
  // The account to mint to
  const targetAccount = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
  
  // Amount to mint (1000 WDOGE)
  const mintAmount = ethers.utils.parseEther("1000");
  
  // Mint to the target account
  await wdoge.mint(targetAccount, mintAmount);
  console.log(`Minted 1000 WDOGE to ${targetAccount}`);
  
  // Get and log the new balance
  const balance = await wdoge.balanceOf(targetAccount);
  console.log(`New balance: ${ethers.utils.formatEther(balance)} WDOGE`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
