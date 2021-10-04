const { assert, expect } = require('chai');
const { ethers } = require('hardhat');
const { BigNumber } = require("ethers");

describe("SimpleToken tests", function () {
    let token;
    beforeEach(async function () {
        const contract = await ethers.getContractFactory("SimpleToken");
        token = await contract.deploy(
            "Test Token",
            "TST",
            1000,
            "http://someurl.com/metadata/"
        );

        await token.deployed();
    })

    it("Should return the right name and symbol", async function () {
        expect(await token.name()).to.equal("Test Token");
        expect(await token.symbol()).to.equal("TST");
    });

    it("Deployment should NOT assign any of tokens to the owner", async function () {
        const [owner] = await ethers.getSigners();
        const ownerBalance = await token.balanceOf(owner.address);

        expect(BigNumber.from("0")._hex).to.equal(ownerBalance._hex);
    });

    it("Airdrop Should transfer tokens to addresses (2 each)", async function () {
        const [owner, addr1, addr2] = await ethers.getSigners();

        await token.airdrop([addr1.address, addr2.address], 2)

        const addr1Balance = await token.balanceOf(addr1.address);
        expect(BigNumber.from("2")._hex).to.equal(addr1Balance._hex);

        const addr2Balance = await token.balanceOf(addr2.address);
        expect(BigNumber.from("2")._hex).to.equal(addr2Balance._hex);

        const airdropped = await token.totalAirdropped();
        expect(BigNumber.from(airdropped)._hex).to.equal(BigNumber.from(4)._hex);
    });

    it("Minting should fail when insufficient fund", async function () {
        let error = null
        try {
            await token.mintToken(1, { value: ethers.utils.parseEther("0.0001") })
        }
        catch (err) {
            error = err
        }

        expect(error).to.be.an('Error')
        expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Insufficient fund'")

    });

    it("Minting should success when NOT exceed limit", async function () {
        const [owner] = await ethers.getSigners();

        let error = null
        try {
            await token.mintToken(2, { value: ethers.utils.parseEther("0.002") })
        }
        catch (err) {
            error = err
        }

        expect(error).not.to.be.an('Error')
        let balance = await token.balanceOf(owner.address);
        expect(BigNumber.from("2")._hex).to.equal(balance._hex);

        let total = await token.totalSupply();
        expect(BigNumber.from(total)._hex).to.equal(BigNumber.from("2")._hex);

        try {
            await token.mintToken(2, { value: ethers.utils.parseEther("0.002") })
        }
        catch (err) {
            error = err
        }

        balance = await token.balanceOf(owner.address);
        expect(BigNumber.from("4")._hex).to.equal(balance._hex);

        total = await token.totalSupply();
        expect(BigNumber.from(total)._hex).to.equal(BigNumber.from("4")._hex);
    });

    it("Minting should fail when exceed limit", async function () {    
        const [owner] = await ethers.getSigners();
        
    
        let error = null
        try {
          await token.mintToken(10, {value: ethers.utils.parseEther("0.01")})
        }
        catch (err) {
          error = err
        }
    
        expect(error).not.to.be.an('Error')
        let balance = await token.balanceOf(owner.address);
        expect(BigNumber.from("10")._hex).to.equal(balance._hex);
    
        let total = await token.totalSupply();
        expect(BigNumber.from(total)._hex).to.equal(BigNumber.from("10")._hex);;
    
        try {
            await token.mintToken(11, {value: ethers.utils.parseEther("0.011")})
        }
        catch (err) {
          error = err
        }
    
        expect(error).to.be.an('Error')
        expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'Transaction exceed limit'")
    
        balance = await token.balanceOf(owner.address);
        expect(BigNumber.from("10")._hex).to.equal(balance._hex);
    
        total = await token.totalSupply();
        expect(BigNumber.from(total)._hex).to.equal(BigNumber.from("10")._hex);
      });

      it("URI should be valid", async function () {    
        const [owner] = await ethers.getSigners();
    
        let error = null
        try {
          await token.mintToken(10, {value: ethers.utils.parseEther("1.0")})
        }
        catch (err) {
          error = err
        }
    
        expect(error).not.to.be.an('Error')
        let balance = await token.balanceOf(owner.address);
        expect(BigNumber.from("10")._hex).to.equal(balance._hex);
    
        let metadata = await token.tokenURI(1);
        expect(metadata).to.equal("http://someurl.com/metadata/1.json");

        metadata = await token.tokenURI(2);
        expect(metadata).to.equal("http://someurl.com/metadata/2.json");
      });
});