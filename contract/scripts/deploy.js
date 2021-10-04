const { BigNumber } = require("ethers");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balanceBefore =  await deployer.getBalance();
  console.log("Account balance:", balanceBefore.toString());

  
  const tokenName = "SimpleToken";
  const tokenSymbol = "SPT";
  const baseUri = "https://simpletoken.web.app/metadata/";
  const defaultUri = "https://simpletoken.web.app/metadata/default.json";
  const maxSupply = 1000;

  const contract = await hre.ethers.getContractFactory("SimpleToken");
  const token = await contract.deploy(tokenName, tokenSymbol, maxSupply, baseUri, defaultUri);

  await token.deployed()

  // generate verify command
  console.log("Contract deployed to:", token.address);
  console.log("Verify contract with following command");
  console.log("\r\n BSC Testnet");
  console.log(`npx hardhat verify --network bsctestnet "${tokenName}" "${tokenSymbol}" ${maxSupply} "${baseUri}" "${defaultUri}`);

  const balanceAfter =  await deployer.getBalance();
  const gasUsed = balanceBefore - balanceAfter;

  console.log(`Fee used: ${gasUsed}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });