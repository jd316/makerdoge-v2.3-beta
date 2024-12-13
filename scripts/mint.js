const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Get the WDOGE contract
  const WDOGE = await ethers.getContractFactory("WDOGE");
  const wdoge = WDOGE.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  
  // Your MetaMask address
  const userAddress = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
  
  // Mint 1000 WDOGE
  const mintAmount = ethers.utils.parseEther("1000");
  await wdoge.connect(signer).mint(userAddress, mintAmount);
  
  console.log(`Minted 1000 WDOGE to ${userAddress}`);
  
  // Get balance
  const balance = await wdoge.balanceOf(userAddress);
  console.log(`New balance: ${ethers.utils.formatEther(balance)} WDOGE`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
