// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./USDm.sol";
import "./MockPriceFeed.sol";

contract DogeMakerVault is ReentrancyGuard, Ownable {
    IERC20 public wdoge;
    USDm public usdm;
    MockPriceFeed public priceFeed;

    uint256 public constant COLLATERALIZATION_RATIO = 150; // 150%
    uint256 public constant LIQUIDATION_RATIO = 130; // 130%
    uint256 public constant PRICE_PRECISION = 1e8; // Match Chainlink price feed decimals
    uint256 public constant INTEREST_RATE_PRECISION = 1e4; // 10000 = 100%
    
    uint256 public borrowRate = 500; // 5% annual rate (500 basis points)
    uint256 public lastInterestUpdate;

    struct VaultPosition {
        uint256 collateral;
        uint256 debt;
        uint256 lastInterestAccrual;
    }

    mapping(address => VaultPosition) public vaults;
    uint256 public totalCollateral;
    uint256 public totalDebt;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event BorrowRateUpdated(uint256 newRate);
    event InterestAccrued(address indexed user, uint256 amount);

    constructor(address _wdoge, address _priceFeed) {
        wdoge = IERC20(_wdoge);
        priceFeed = MockPriceFeed(_priceFeed);
        usdm = new USDm();
        lastInterestUpdate = block.timestamp;
    }

    function setBorrowRate(uint256 newRate) external onlyOwner {
        require(newRate <= 2000, "Rate too high"); // Max 20%
        borrowRate = newRate;
        emit BorrowRateUpdated(newRate);
    }

    function calculateInterest(address user) public view returns (uint256) {
        VaultPosition storage vault = vaults[user];
        if (vault.debt == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - vault.lastInterestAccrual;
        return (vault.debt * borrowRate * timeElapsed) / (365 days * INTEREST_RATE_PRECISION);
    }

    function accrueInterest(address user) internal {
        uint256 interest = calculateInterest(user);
        if (interest > 0) {
            VaultPosition storage vault = vaults[user];
            vault.debt += interest;
            totalDebt += interest;
            vault.lastInterestAccrual = block.timestamp;
            emit InterestAccrued(user, interest);
        }
    }

    function getDogePriceInUSD() public view returns (uint256) {
        return uint256(priceFeed.latestAnswer());
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(wdoge.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        vaults[msg.sender].collateral += amount;
        totalCollateral += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        VaultPosition storage vault = vaults[msg.sender];
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= vault.collateral, "Insufficient collateral");
        
        uint256 newCollateralValue = ((vault.collateral - amount) * getDogePriceInUSD()) / PRICE_PRECISION;
        uint256 minimumCollateral = (vault.debt * COLLATERALIZATION_RATIO) / 100;
        require(newCollateralValue >= minimumCollateral, "Would break collateral ratio");

        vault.collateral -= amount;
        totalCollateral -= amount;
        require(wdoge.transfer(msg.sender, amount), "Transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        VaultPosition storage vault = vaults[msg.sender];
        
        // Accrue any pending interest first
        accrueInterest(msg.sender);
        
        uint256 collateralValueInUSD = (vault.collateral * getDogePriceInUSD()) / PRICE_PRECISION;
        uint256 newTotalDebt = vault.debt + amount;
        require(collateralValueInUSD * 100 >= newTotalDebt * COLLATERALIZATION_RATIO, "Insufficient collateral");

        vault.debt += amount;
        totalDebt += amount;
        if (vault.lastInterestAccrual == 0) {
            vault.lastInterestAccrual = block.timestamp;
        }
        usdm.mint(msg.sender, amount);
        emit Borrow(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        VaultPosition storage vault = vaults[msg.sender];
        
        // Accrue any pending interest first
        accrueInterest(msg.sender);
        
        require(vault.debt >= amount, "Amount exceeds debt");

        vault.debt -= amount;
        totalDebt -= amount;
        usdm.burn(msg.sender, amount);
        emit Repay(msg.sender, amount);
    }

    function getTotalStats() external view returns (uint256, uint256) {
        return (totalCollateral, totalDebt);
    }

    function getVaultInfo(address user) external view returns (
        uint256 collateral,
        uint256 debt,
        uint256 pendingInterest
    ) {
        VaultPosition memory vault = vaults[user];
        uint256 interest = calculateInterest(user);
        return (vault.collateral, vault.debt, interest);
    }

    function getCollateralRatio(address user) public view returns (uint256) {
        VaultPosition memory vault = vaults[user];
        if (vault.debt == 0) return type(uint256).max;
        
        uint256 collateralValueInUSD = (vault.collateral * getDogePriceInUSD()) / PRICE_PRECISION;
        return (collateralValueInUSD * 100) / vault.debt;
    }

    function getUserCollateral(address user) public view returns (uint256) {
        return vaults[user].collateral;
    }

    function getUserDebt(address user) public view returns (uint256) {
        return vaults[user].debt;
    }

    function getUserLastAccrual(address user) public view returns (uint256) {
        return vaults[user].lastInterestAccrual;
    }
}
