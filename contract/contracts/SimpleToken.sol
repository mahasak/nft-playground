// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SimpleToken is Ownable, ERC721, ERC721Enumerable, ReentrancyGuard {
    using SafeMath for uint256;

    uint256 public maxSupply;
    uint256 public maxTokenAllow = 10;
    uint256 public price = 1000000000000000; 

    string public baseUrl;
    
    constructor(string memory _name, string memory _symbol, uint256 _maxSupply, string memory _baseUrl) 
        ERC721(_name, _symbol)
    {
        baseUrl = _baseUrl;
        maxSupply = _maxSupply;
    }

    function mintToken(uint256 amount) public payable nonReentrant returns (bool) {
        require(msg.sender == tx.origin , "Address not permitted");
        require(amount <= maxTokenAllow , "Transaction exceed limit");
        require(msg.value >= amount.mul(price), "Insufficiend fund");
  
        return _mintToken(_msgSender(), amount);
    }

    function _mintToken( address addr, uint256 amount) internal returns (bool) {
        for (uint256 i = 0; i < amount; i+=1) {
            uint256 tokenIndex = totalSupply();
            
            if (tokenIndex < maxSupply) {
                _safeMint(addr, tokenIndex);
            }
        }

        return true;
    }

    function tokenURI(uint256 tokenId) public view override (ERC721) returns (string memory) {
        require(tokenId < totalSupply(), "Token not exist.");
        
        return string(abi.encodePacked(baseUrl, tokenId, ".json"));        
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable){
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
