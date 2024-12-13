// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDm is ERC20, Ownable {
    address public vaultAddress;

    constructor() ERC20("USD Maker", "USDm") {
        vaultAddress = msg.sender;
    }

    function setVaultAddress(address _vaultAddress) external onlyOwner {
        vaultAddress = _vaultAddress;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == vaultAddress, "Only vault can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == vaultAddress, "Only vault can burn");
        _burn(from, amount);
    }
}
