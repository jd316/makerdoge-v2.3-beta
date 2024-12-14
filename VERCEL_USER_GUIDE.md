# MAKERdoge v2.3 User Guide (Vercel App)

Welcome to MAKERdoge v2.3! This guide will help you navigate and use our DeFi platform deployed on Vercel.

## Prerequisites

Before you begin, make sure you have:

    - A web browser (Chrome, Firefox, or Brave recommended)
    - MetaMask wallet installed and configured
    - Some DOGE in your wallet for transaction fees
    - Basic understanding of DeFi concepts

## Getting Started

1. **Access the Platform**
    - Visit our Vercel app at: [MAKERdoge v2.3](https://makerdoge-v2.vercel.app)
    - Connect your MetaMask wallet by clicking the "Connect Wallet" button
    - Ensure you're on the correct network (Network details will be displayed in the UI)

2. **Setting Up Your Wallet**
    - Add the WDOGE token to MetaMask:
        1. Click "Add Token" in MetaMask
        2. Select "Custom Token"
        3. Paste the WDOGE contract address (available on the platform)
        4. The token symbol (WDOGE) and decimals (18) will auto-fill
    - Repeat the same process for USDm token

## Core Features

### 1. Wrapping DOGE

Before you can use the platform, you need to wrap your DOGE:

1. Navigate to the "Wrap" section
2. Enter the amount of DOGE you want to wrap
3. Click "Approve" to allow the contract to use your DOGE
4. Click "Wrap" to convert your DOGE to WDOGE

### 2. Creating a Vault

1. Go to the "Vault" section
2. Click "Create New Vault"
3. Enter the amount of WDOGE you want to deposit as collateral
4. The UI will show you:
        - Maximum USDm you can mint
        - Current collateralization ratio
        - Liquidation price
5. Click "Create Vault" to confirm

### 3. Managing Your Vault

Monitor your vault's health:

    - **Collateralization Ratio**: Keep above 150% to avoid liquidation
    - **Liquidation Price**: The price at which your vault becomes eligible for liquidation
    - **Interest Rate**: Currently fixed at 5% APR

Actions you can take:

    - **Deposit More**: Add more WDOGE collateral to improve your ratio
    - **Withdraw**: Remove excess collateral if your ratio permits
    - **Repay**: Pay back USDm to reduce your debt
    - **Generate**: Mint more USDm if your collateral ratio allows

### 4. Risk Management

    - Keep your collateralization ratio well above 150%
    - Monitor DOGE price movements
    - Set up alerts for when your ratio approaches 150%
    - Have extra WDOGE ready to deposit if needed

## Important Numbers to Remember

    - Minimum Collateralization Ratio: 150%
    - Liquidation Threshold: 130%
    - Interest Rate: 5% APR
    - Maximum Loan-to-Value (LTV): 66.67%

## Safety Tips

1. Start small and familiarize yourself with the platform
2. Never invest more than you can afford to lose
3. Keep extra collateral ready for market downturns
4. Monitor your vault regularly
5. Understand the risks of liquidation

## Troubleshooting

### Common Issues and Solutions

1. **Transaction Failed**
        - Check if you have enough network tokens for gas
        - Ensure your collateralization ratio stays above 150%
        - Try increasing gas price slightly

2. **MetaMask Not Connecting**
        - Refresh the page
        - Ensure you're on the correct network
        - Try disconnecting and reconnecting MetaMask

3. **Price Feed Issues**
        - Refresh the page
        - Check if there are any announced maintenance periods
        - Contact support if issues persist

## Support and Resources

    - Join our Discord community: [Discord](https://discord.gg/makerdoge)
    - Follow us on Twitter: [@MAKERdoge](https://twitter.com/MAKERdoge)
    - Email support: support@makerdoge.com
    - Check our GitHub for technical documentation: [GitHub](https://github.com/makerdoge/v2.3)

## Emergency Procedures

If you notice any unusual activity or potential security issues:

1. Stop all transactions immediately
2. Document what you were doing when the issue occurred
3. Contact support immediately
4. Do not share sensitive information in public channels

Remember: Your security is our priority. If something doesn't feel right, don't proceed with the transaction.

---

### Document Information

Last Updated: December 14, 2024

### Disclaimer

This is a beta version. Please use the platform responsibly and be aware of the risks involved in DeFi protocols.
