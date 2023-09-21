const { ethers } = require("hardhat");

async function main() {
  // Fetch contract
  const Token = await ethers.getContractFactory("Token")
  
  // Deploy contract
  const token = await Token.deploy()

  // Log the address
  console.log(`Token deployed to: ${token.address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
