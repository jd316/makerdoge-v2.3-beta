import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './BorrowInterface.css';

const BorrowInterface = ({ provider, signer, contracts }) => {
  const [marketPrice, setMarketPrice] = useState('0.40');
  const [liquidationPrice, setLiquidationPrice] = useState('0.00');
  const [loanToValue, setLoanToValue] = useState('0.00');
  const [collateralDeposited, setCollateralDeposited] = useState('0.00');
  const [positionDebt, setPositionDebt] = useState('0.00');
  const [borrowRate, setBorrowRate] = useState('0.00');
  const [netValue, setNetValue] = useState('0.00');
  const [availableToWithdraw, setAvailableToWithdraw] = useState('0.00');
  const [availableToBorrow, setAvailableToBorrow] = useState('0.00');
  const [depositAmount, setDepositAmount] = useState('0');
  const [borrowAmount, setBorrowAmount] = useState('0');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [wdogeBalance, setWdogeBalance] = useState('0');
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateMarketPrice = useCallback(async () => {
    try {
      if (contracts.priceFeed) {
        const price = await contracts.priceFeed.getPrice();
        console.log('Raw price from contract:', price.toString());
        const formattedPrice = ethers.utils.formatUnits(price, 18);
        console.log('Formatted price:', formattedPrice);
        setMarketPrice(formattedPrice);
      }
    } catch (err) {
      console.error('Error getting market price:', err);
    }
  }, [contracts.priceFeed]);

  const checkApprovalAndBalance = useCallback(async () => {
    try {
      if (!signer || !contracts.wdoge) return;
      
      const address = await signer.getAddress();
      console.log('Checking balance for address:', address);
      // Check WDOGE balance
      const balance = await contracts.wdoge.balanceOf(address);
      console.log('Fetched WDOGE balance:', balance.toString());
      setWdogeBalance(ethers.utils.formatEther(balance));
      console.log('Formatted WDOGE Balance:', ethers.utils.formatEther(balance));

      // Check approval
      const allowance = await contracts.wdoge.allowance(address, contracts.vault.address);
      setIsApproved(allowance.gt(ethers.constants.Zero));
      console.log('Is Approved:', allowance.gt(ethers.constants.Zero));
    } catch (err) {
      console.error('Error checking approval and balance:', err);
    }
  }, [signer, contracts.wdoge, contracts.vault]);

  const updatePositionInfo = useCallback(async (userAddress) => {
    try {
      if (!contracts.vault || !userAddress) {
        console.error('Missing vault contract or user address');
        return;
      }

      console.log('Fetching position for address:', userAddress);
      
      // Debug contract state
      const borrowRate = await contracts.vault.borrowRate();
      console.log('Current borrow rate:', borrowRate.toString(), 'basis points');
      
      // Get collateral and debt using explicit getter functions
      const collateralBN = await contracts.vault.getUserCollateral(userAddress);
      const debtBN = await contracts.vault.getUserDebt(userAddress);
      const pendingInterestBN = await contracts.vault.getPendingInterest(userAddress);
      
      console.log('Raw values:', {
        collateral: collateralBN.toString(),
        debt: debtBN.toString(),
        pendingInterest: pendingInterestBN.toString()
      });

      const collateral = ethers.utils.formatEther(collateralBN);
      const debt = ethers.utils.formatEther(debtBN);
      const interest = ethers.utils.formatEther(pendingInterestBN);

      console.log('Formatted values:', {
        collateral,
        debt,
        interest,
        borrowRate: (Number(borrowRate) / 100).toFixed(2) + '%'
      });

      setCollateralDeposited(collateral);
      setPositionDebt(debt);
      setBorrowRate((Number(borrowRate) / 100).toFixed(2));

      // Calculate other metrics
      if (contracts.priceFeed) {
        const price = await contracts.priceFeed.getPrice();
        const priceInEther = ethers.utils.formatUnits(price, 18);
        console.log('Current DOGE price:', priceInEther, 'USD');
        
        // Calculate loan to value
        if (Number(collateral) > 0) {
          const ltv = (Number(debt) / (Number(collateral) * Number(priceInEther))) * 100;
          console.log('Calculated LTV:', ltv);
          setLoanToValue(ltv.toFixed(2));
        }

        // Calculate liquidation price
        if (Number(debt) > 0) {
          const liqPrice = (Number(debt) * 1.5) / Number(collateral);
          console.log('Calculated liquidation price:', liqPrice);
          setLiquidationPrice(liqPrice.toFixed(2));
        }

        // Calculate net value
        const netVal = Number(collateral) * Number(priceInEther) - Number(debt);
        console.log('Calculated net value:', netVal);
        setNetValue(netVal.toFixed(2));

        // Calculate available to withdraw
        const maxWithdraw = Number(collateral) - (Number(debt) * 1.5 / Number(priceInEther));
        console.log('Calculated max withdraw:', maxWithdraw);
        setAvailableToWithdraw(Math.max(0, maxWithdraw).toFixed(2));

        // Calculate available to borrow
        const maxBorrow = (Number(collateral) * Number(priceInEther) / 1.5) - Number(debt);
        console.log('Calculated max borrow:', maxBorrow);
        setAvailableToBorrow(Math.max(0, maxBorrow).toFixed(2));
      } else {
        console.error('PriceFeed contract not initialized');
      }
    } catch (err) {
      console.error('Error updating position:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
      setError('Error updating position: ' + err.message);
    }
  }, [contracts.vault, contracts.priceFeed]);

  useEffect(() => {
    const init = async () => {
      if (signer && contracts.wdoge && contracts.vault) {
        const address = await signer.getAddress();
        setAccount(address);
        await checkApprovalAndBalance();
        await updatePositionInfo(address);
        await updateMarketPrice();
      }
    };

    init();
  }, [signer, contracts, checkApprovalAndBalance, updatePositionInfo, updateMarketPrice]);

  // Add network check function
  const checkNetwork = async () => {
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 80002) {
        throw new Error('Please connect to Polygon Amoy Testnet (Chain ID: 80002)');
      }
    } catch (err) {
      console.error('Network check failed:', err);
      throw err;
    }
  };

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      setError('');

      await checkNetwork();

      const address = await signer.getAddress();
      const depositAmountWei = ethers.utils.parseEther(depositAmount.toString());

      // Check WDOGE balance
      const balance = await contracts.wdoge.balanceOf(address);
      if (balance.lt(depositAmountWei)) {
        throw new Error('Insufficient WDOGE balance');
      }

      // Check and handle approval if needed
      const currentAllowance = await contracts.wdoge.allowance(address, contracts.vault.address);
      if (currentAllowance.lt(depositAmountWei)) {
        console.log('Approval needed. Requesting approval...');
        const approveTx = await contracts.wdoge.approve(contracts.vault.address, depositAmountWei);
        await approveTx.wait();
        console.log('Approval granted');
        setIsApproved(true);
      }

      // Proceed with deposit
      console.log('Depositing', depositAmount, 'WDOGE');
      const tx = await contracts.vault.deposit(depositAmountWei);
      await tx.wait();

      // Update UI
      await checkApprovalAndBalance();
      await updatePositionInfo(address);
      setDepositAmount('0');
      
    } catch (err) {
      console.error('Error in deposit:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Convert borrow amount to Wei
      const borrowAmountWei = ethers.utils.parseEther(borrowAmount.toString());
      console.log('Borrow amount in Wei:', borrowAmountWei.toString());

      // Get initial position info
      const userAddress = await signer.getAddress();
      console.log('Initial position check...');
      const initialCollateral = await contracts.vault.getUserCollateral(userAddress);
      const initialDebt = await contracts.vault.getUserDebt(userAddress);
      const initialInterest = await contracts.vault.calculateInterest(userAddress);
      
      console.log('Initial position:', {
        collateral: ethers.utils.formatEther(initialCollateral),
        debt: ethers.utils.formatEther(initialDebt),
        pendingInterest: ethers.utils.formatEther(initialInterest)
      });

      // Execute borrow
      console.log('Executing borrow...');
      const tx = await contracts.vault.borrow(borrowAmountWei);
      await tx.wait();
      console.log('Borrow successful');

      // Get updated position info
      console.log('Checking updated position...');
      const updatedCollateral = await contracts.vault.getUserCollateral(userAddress);
      const updatedDebt = await contracts.vault.getUserDebt(userAddress);
      const updatedInterest = await contracts.vault.calculateInterest(userAddress);
      
      console.log('Updated position:', {
        collateral: ethers.utils.formatEther(updatedCollateral),
        debt: ethers.utils.formatEther(updatedDebt),
        pendingInterest: ethers.utils.formatEther(updatedInterest)
      });

      // Update UI
      await updatePositionInfo(userAddress);
      setBorrowAmount('0');
    } catch (err) {
      console.error('Error borrowing USDm:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
      setError('Failed to borrow USDm: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add connect wallet function
  const connectWallet = async () => {
    try {
      setError('');
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = await signer.getAddress();
        setAccount(address);
        
        // Check and switch to Hardhat network if needed
        const network = await provider.getNetwork();
        if (network.chainId !== 31337) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7A69' }], // 31337 in hex
            });
          } catch (switchError) {
            // Handle chain not added to MetaMask
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x7A69',
                  chainName: 'Hardhat Network',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['http://127.0.0.1:8545/'],
                }],
              });
            } else {
              throw switchError;
            }
          }
        }
        
        // Initialize after connection
        await checkApprovalAndBalance();
        await updatePositionInfo(address);
        await updateMarketPrice();
      } else {
        throw new Error('Please install MetaMask to use this application');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
    }
  };

  // Add disconnect wallet function
  const disconnectWallet = () => {
    setAccount('');
    setIsApproved(false);
    setWdogeBalance('0');
    setCollateralDeposited('0.00');
    setPositionDebt('0.00');
    setLoanToValue('0.00');
    setLiquidationPrice('0.00');
    setNetValue('0.00');
    setAvailableToWithdraw('0.00');
    setAvailableToBorrow('0.00');
  };

  const testApprove = async () => {
    try {
      const amountToApprove = ethers.utils.parseEther('100'); // Approve 100 WDOGE
      const approveTx = await contracts.wdoge.approve(contracts.vault.address, amountToApprove);
      await approveTx.wait();
      console.log('Approval successful');
      setIsApproved(true);
    } catch (err) {
      console.error('Approval failed:', err);
      setError(err.message);
    }
  };

  return (
    <div className="borrow-interface">
      <div className="header">
        <div className="title">
          DOGE/USDM Borrow
        </div>
        <div className="header-right">
          <div className="market-price">
            Current Market Price {marketPrice} DOGE/USDM
          </div>
          <div className="wallet-controls">
            {account ? (
              <>
                <span className="wallet-address">Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                <button onClick={disconnectWallet} className="wallet-button disconnect">
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <span>Wallet Not Connected</span>
                <button onClick={connectWallet} className="wallet-button connect">
                  Connect Wallet
                </button>
              </>
            )}
          </div>
          <div className="wdoge-balance">
            WDOGE Balance: {wdogeBalance} WDOGE
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="approval-status">
        <span className={`status-indicator ${isApproved ? 'approved' : 'not-approved'}`}>
          {isApproved ? '✓ Approved' : '! Approval Required'}
        </span>
        {account && (
          <button onClick={testApprove} className="approval-button">
            Test Approve
          </button>
        )}
      </div>

      <div className="tabs">
        <button className="tab active">Set up</button>
        <button className="tab">Position Info</button>
      </div>

      <div className="content">
        <div className="overview">
          <h2>Overview</h2>
          <div className="metrics-grid">
            <div className="metric">
              <label>
                Liquidation Price
                <span className="info-icon" title="Price at which your position will be liquidated">ⓘ</span>
              </label>
              <div className="value">
                {liquidationPrice} <span className="unit">DOGE/USDM</span>
              </div>
            </div>
            <div className="metric">
              <label>
                Loan to Value
                <span className="info-icon" title="Current loan to value ratio">ⓘ</span>
              </label>
              <div className="value">
                {loanToValue}<span className="unit">%</span>
              </div>
            </div>
            <div className="metric">
              <label>
                Collateral Deposited
                <span className="info-icon" title="Amount of DOGE deposited as collateral">ⓘ</span>
              </label>
              <div className="value">
                {collateralDeposited} <span className="unit">DOGE</span>
              </div>
            </div>
            <div className="metric">
              <label>
                Position Debt
                <span className="info-icon" title="Current debt in USDM">ⓘ</span>
              </label>
              <div className="value">
                {positionDebt} <span className="unit">USDM</span>
              </div>
            </div>
            <div className="metric">
              <label>
                Borrow Rate
                <span className="info-icon" title="Current borrowing rate">ⓘ</span>
              </label>
              <div className="value">
                {borrowRate}<span className="unit">%</span>
              </div>
            </div>
            <div className="metric">
              <label>
                Net Value
                <span className="info-icon" title="Net value of your position">ⓘ</span>
              </label>
              <div className="value">
                ${netValue}
              </div>
            </div>
            <div className="metric">
              <label>
                Available to Withdraw
                <span className="info-icon" title="Amount of DOGE available to withdraw">ⓘ</span>
              </label>
              <div className="value">
                {availableToWithdraw} <span className="unit">DOGE</span>
              </div>
            </div>
            <div className="metric">
              <label>
                Available to Borrow
                <span className="info-icon" title="Amount of USDM available to borrow">ⓘ</span>
              </label>
              <div className="value">
                {availableToBorrow} <span className="unit">USDM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="configure">
          <h2>Configure your DOGE Layer Borrow Position</h2>
          
          <div className="input-group">
            <label>Deposit DOGE</label>
            <div className="input-with-max">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="usd-value">≈ ${(depositAmount * parseFloat(marketPrice)).toFixed(2)} USD</div>
          </div>

          <div className="input-group">
            <label>Borrow USDM</label>
            <div className="input-with-max">
              <input
                type="number"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="usd-value">≈ ${borrowAmount} USD</div>
          </div>

          {!account ? (
            <button onClick={connectWallet} className="action-button">
              Connect Wallet
            </button>
          ) : (
            <>
              <button
                onClick={handleDeposit}
                className="action-button"
                disabled={isLoading || !depositAmount || depositAmount <= 0}
              >
                Deposit
              </button>
              <button
                onClick={handleBorrow}
                className="action-button"
                disabled={isLoading || !borrowAmount || borrowAmount <= 0}
              >
                Borrow
              </button>
            </>
          )}

          {isLoading && <div className="loading">Transaction in progress...</div>}
        </div>
      </div>
    </div>
  );
};

export default BorrowInterface;
