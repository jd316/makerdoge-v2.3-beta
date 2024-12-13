// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WDOGE is ERC20 {
    constructor() ERC20("Wrapped DOGE", "wDOGE") {
        // Mint some initial tokens for testing
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Function to mint tokens (for testing purposes)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
