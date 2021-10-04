/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-ethers");

 const { privateKey, apiKey, coinmarketcapKey} = require('./.secrets.json');
 
 module.exports = {
   solidity: {
     version: "0.8.4",
     settings: {
       optimizer: {
         enabled: true,
         runs: 200,
       },
     },
   },
   defaultNetwork: "hardhat",
   networks: {
     hardhat: {
     },
     bsctestnet: {
       url: "https://data-seed-prebsc-2-s3.binance.org:8545/",
       chainId: 97,
       gasPrice: 20000000000,
       accounts: [privateKey]
     },
   },
   paths: {
     sources: "./contracts",
     tests: "./tests",
     cache: "./cache",
     artifacts: "./artifacts"
   },
   mocha: {
     timeout: 20000
   },
   etherscan: {
     apiKey: apiKey
   },
   gasReporter: {
     currency: 'USD',
     gasPrice: 62,
     coinmarketcap: coinmarketcapKey,
   }
 };
 