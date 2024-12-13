# MAKERdoge v2.3

A decentralized finance (DeFi) protocol inspired by MakerDAO, specifically designed for Dogecoin. Users can deposit wrapped Dogecoin (wDOGE) as collateral to mint USDm stablecoins, creating a stable and secure lending platform in the Dogecoin ecosystem.

## Features

- Deposit wDOGE as collateral
- Mint USDm stablecoins against collateral
- Dynamic interest rate system (5% APR by default)
- Interest accrual based on time and borrow amount
- Maintain a minimum collateralization ratio of 150%
- Liquidation threshold at 130%
- Real-time position monitoring
- Clean and modern React-based frontend

## Prerequisites

- Node.js >= 16
- npm >= 7
- MetaMask wallet
- Test DOGE for transaction fees

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MAKERdoge-v2.3
```

2. Install dependencies:
```bash
npm install
cd frontend
npm install
cd ..
```

## Development Setup

### Contract Deployment and Frontend Configuration

The project now includes an automated deployment process that updates the frontend configuration automatically:

1. The contract addresses are stored in `frontend/src/config/contracts.js`
2. The deployment script (`scripts/deploy.js`) automatically updates these addresses
3. The frontend imports addresses directly from the config file

### Deployment Steps

1. Start the local Hardhat node:
```bash
npx hardhat node
```

2. Deploy the contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
This will:
- Deploy all contracts (MockPriceFeed, WDOGE, USDm, DogeMakerVault)
- Automatically update the frontend configuration with new contract addresses
- Mint initial WDOGE tokens to test accounts

3. Start the frontend:
```bash
cd frontend
npm start
```

### Test Accounts
- Deployer account: Has 1000 WDOGE tokens
- Test account (0x976EA74026E726554dB657fA54763abd0C3a0aa9): Has 1000 WDOGE tokens

### MetaMask Setup
1. Connect to localhost:8545 (Hardhat Network)
2. Import one of the test accounts using their private key
3. Add WDOGE token to MetaMask using the deployed contract address

## Local Development

1. Start a local Hardhat node:
```bash
npx hardhat node
```

2. Deploy the contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Update contract addresses in `frontend/src/App.js` with the addresses from the deployment output

4. Start the frontend:
```bash
cd frontend
npm start
```

5. Configure MetaMask:
   - Network Name: Hardhat
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

6. Import a test account:
   - Use one of the private keys provided by Hardhat node
   - Each test account comes with 1000 WDOGE pre-minted

## Interest Rate Mechanism

The protocol implements a dynamic interest rate system:
- Default rate: 5% APR (500 basis points)
- Interest accrues continuously based on borrowed amount
- Maximum rate cap: 20% APR (2000 basis points)
- Interest is calculated using the formula: 
  ```
  Interest = (Debt * Rate * TimeElapsed) / (365 days * 10000)
  ```
- Only the contract owner can adjust the interest rate

## Using the dApp

1. Connect Wallet:
   - Click "Connect Wallet" in the interface
   - Approve MetaMask connection
   - Ensure you're on the Hardhat network

2. Deposit Collateral:
   - Approve the vault to spend your WDOGE
   - Enter the amount of WDOGE to deposit
   - Click "Deposit"
   - Confirm the transaction in MetaMask

3. Borrow USDm:
   - Enter the amount of USDm to borrow
   - Maintain at least 150% collateralization ratio
   - Click "Borrow"
   - Confirm the transaction

4. Monitor Position:
   - View your collateral amount
   - Track your current debt
   - Monitor accrued interest
   - Watch collateralization ratio
   - Check liquidation price

5. Manage Risk:
   - Keep collateralization ratio above 150%
   - Add collateral if ratio drops
   - Repay debt to reduce exposure
   - Monitor DOGE price movements

## Key Metrics

- Collateralization Ratio: Minimum 150%
- Liquidation Threshold: 130%
- Interest Rate: 5% APR (adjustable up to 20%)
- Price Feed: Updated in real-time
- Maximum Borrow: Up to 66.67% of collateral value

## Development Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
cd frontend && npm start
```

## Security Considerations

- This protocol is in beta - use with caution
- Maintain a safe collateralization ratio above 150%
- Monitor your position regularly
- Be aware of DOGE price volatility
- Verify all transaction details before signing
- Keep your private keys secure

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
