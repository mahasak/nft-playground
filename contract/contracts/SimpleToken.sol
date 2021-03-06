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

    uint256 public maxAirdrop = 100;
    uint256 public maxSupply;
    uint256 public maxTokenAllow = 10;
    uint256 public price = 1000000000000000;
    uint256 public revealBlock = 0;
    uint256 public startSaleBlock = 0;
    uint256 public endSaleBlock = 0;
    uint256 public totalAirdropped = 0;

    string public baseUrl;
    string public defaultUrl;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _baseUrl,
        string memory _defaultUrl
    ) ERC721(_name, _symbol) {
        baseUrl = _baseUrl;
        defaultUrl = _defaultUrl;
        maxSupply = _maxSupply;
    }

    modifier saleEnabled(uint256 amount) {
        require(totalSupply().add(amount) <= maxSupply, "Sold out");
        require(
            startSaleBlock > 0 && block.number >= startSaleBlock,
            "Sale not started"
        );
        if (endSaleBlock > 0) {
            require(block.number <= endSaleBlock, "Sale ended");
        }
        _;
    }

    function airdrop(address[] memory list, uint256 amount) public onlyOwner {
        require(
            totalSupply().add(list.length.mul(amount)) <= maxSupply,
            "Exceed max supply"
        );
        require(
            totalAirdropped.add(list.length.mul(amount)) <= maxAirdrop,
            "Exceed max airdrop"
        );

        for (uint256 i = 0; i < list.length; i += 1) {
            _mintToken(list[i], amount);
        }

        totalAirdropped = totalAirdropped.add(list.length.mul(amount));
    }

    function mintToken(uint256 amount)
        public
        payable
        saleEnabled(amount)
        nonReentrant
        returns (bool)
    {
        require(msg.sender == tx.origin, "Address not permitted");
        require(amount <= maxTokenAllow, "Transaction exceed limit");
        require(msg.value >= amount.mul(price), "Insufficient fund");

        return _mintToken(_msgSender(), amount);
    }

    function _mintToken(address addr, uint256 amount) internal returns (bool) {
        for (uint256 i = 0; i < amount; i += 1) {
            uint256 tokenIndex = totalSupply();

            if (tokenIndex < maxSupply) {
                _safeMint(addr, tokenIndex);
            }
        }

        return true;
    }

    function isRevealed() public view returns (bool) {
        return revealBlock > 0 && block.number > revealBlock;
    }

    function setRevealBlock(uint256 blk) public onlyOwner {
        revealBlock = blk;
    }

    function setStartSaleBlock(uint256 blk) public onlyOwner {
        startSaleBlock = blk;
    }

    function setEndSaleBlock(uint256 blk) public onlyOwner {
        endSaleBlock = blk;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        require(tokenId < totalSupply(), "Token not exist.");

        return
            isRevealed()
                ? string(
                    abi.encodePacked(
                        baseUrl,
                        Strings.toString(tokenId),
                        ".json"
                    )
                )
                : defaultUrl;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
