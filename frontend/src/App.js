import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import BorrowInterface from './components/BorrowInterface';

// Import contract ABIs
import WDOGEArtifact from './abis/WDOGE.json';
import USDmArtifact from './abis/USDm.json';
import DogeMakerVaultArtifact from './abis/DogeMakerVault.json';
import MockPriceFeedArtifact from './abis/MockPriceFeed.json';

// Import contract addresses from config
import CONTRACT_ADDRESSES from './config/contracts';

const mockPriceFeedAddress = CONTRACT_ADDRESSES.PRICE_FEED;
const wDogeAddress = CONTRACT_ADDRESSES.WDOGE;
const usdMAddress = CONTRACT_ADDRESSES.USDm;
const dogeMakerVaultAddress = CONTRACT_ADDRESSES.VAULT;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({
    wdoge: null,
    usdm: null,
    vault: null,
    priceFeed: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeContracts = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('Please install MetaMask to use this dApp');
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Add and switch to Amoy network
        try {
          const amoyNetwork = {
            chainId: '0x13882', // 80002 in hexadecimal
            chainName: 'Polygon Amoy Testnet',
            rpcUrls: ['https://rpc-amoy.polygon.technology'],
            nativeCurrency: {
              name: 'POL',
              symbol: 'POL',
              decimals: 18,
            },
            blockExplorerUrls: ['https://amoy.polygonscan.com'],
          };

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [amoyNetwork],
          });

          console.log('Successfully switched to Amoy network');
        } catch (switchError) {
          console.error('Failed to switch network:', switchError);
          throw new Error('Please switch to Polygon Amoy Testnet to use this dApp');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);

        console.log('Initializing contracts with addresses:', CONTRACT_ADDRESSES);

        // Initialize contracts with signer
        const wdoge = new ethers.Contract(wDogeAddress, WDOGEArtifact.abi, signer);
        console.log('WDOGE contract initialized');

        const usdm = new ethers.Contract(usdMAddress, USDmArtifact.abi, signer);
        console.log('USDm contract initialized');

        const vault = new ethers.Contract(dogeMakerVaultAddress, DogeMakerVaultArtifact.abi, signer);
        console.log('Vault contract initialized');

        const priceFeed = new ethers.Contract(mockPriceFeedAddress, MockPriceFeedArtifact.abi, signer);
        console.log('PriceFeed contract initialized');

        setContracts({
          wdoge,
          usdm,
          vault,
          priceFeed
        });

        // Test contract calls
        const price = await priceFeed.latestAnswer();
        console.log('Current price:', ethers.utils.formatUnits(price, 8));

        const account = await signer.getAddress();
        const balance = await wdoge.balanceOf(account);
        console.log('WDOGE balance:', ethers.utils.formatEther(balance));

        // Listen for network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

        // Listen for account changes
        window.ethereum.on('accountsChanged', () => {
          window.location.reload();
        });

      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
      }
    };

    initializeContracts();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  if (error) {
    return <div className="App error">{error}</div>;
  }

  return (
    <div className="App">
      <h1>DogeMaker</h1>
      <p>A Simplified MakerDAO for Dogecoin</p>
      <BorrowInterface
        provider={provider}
        signer={signer}
        contracts={contracts}
      />
    </div>
  );
}

export default App;
