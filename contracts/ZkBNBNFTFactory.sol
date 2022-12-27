// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interfaces/INFTFactory.sol";

contract ZkBNBNFTFactory is ERC721, INFTFactory {
  // tokenId => creator
  mapping(uint256 => address) private _nftCreators;

  string public _base;

  address private _zkbnbAddress;

  constructor(string memory name, string memory symbol, string memory base, address zkbnbAddress) ERC721(name, symbol) {
    _zkbnbAddress = zkbnbAddress;
    _base = base;
  }

  function mintFromZkBNB(
    address _creatorAddress,
    address _toAddress,
    uint256 _nftTokenId,
    bytes memory _extraData
  ) external override {
    require(_msgSender() == _zkbnbAddress, "only zkbnbAddress");
    // Minting allowed only from zkbnb
    _safeMint(_toAddress, _nftTokenId);
    _nftCreators[_nftTokenId] = _creatorAddress;
    emit MintNFTFromZkBNB(_creatorAddress, _toAddress, _nftTokenId, _extraData);
  }

  function _beforeTokenTransfer(address, address to, uint256 tokenId) internal virtual {
    // Sending to address `0` means that the token is getting burned.
    if (to == address(0)) {
      delete _nftCreators[tokenId];
    }
  }

  function getCreator(uint256 _tokenId) external view returns (address) {
    return _nftCreators[_tokenId];
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "tokenId not exist");
    return string(abi.encodePacked(_base, tokenId));
  }

  function updateBaseUri(string memory base) external {
    _base = base;
  }
}
