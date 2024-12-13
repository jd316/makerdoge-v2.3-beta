const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  const wdogeAddress = '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1'; // Update with your WDOGE contract address
  const recipient = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Update with your account address
  const amount = ethers.utils.parseEther('1000');

  const WDOGE = await ethers.getContractFactory('WDOGE');
  const wdoge = WDOGE.attach(wdogeAddress);

  console.log(`Minting 1000 WDOGE to ${recipient}...`);
  const tx = await wdoge.mint(recipient, amount);
  await tx.wait();
  console.log('Minting complete.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
