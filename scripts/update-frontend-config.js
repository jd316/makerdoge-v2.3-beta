const fs = require('fs');
const path = require('path');

async function updateFrontendConfig(addresses) {
    const configContent = `// Contract addresses for local development
const CONTRACT_ADDRESSES = {
  WDOGE: '${addresses.WDOGE}',
  USDm: '${addresses.USDm}',
  VAULT: '${addresses.VAULT}',
  PRICE_FEED: '${addresses.PRICE_FEED}'
};

export default CONTRACT_ADDRESSES;
`;

    const configPath = path.join(__dirname, '../frontend/src/config/contracts.js');
    fs.writeFileSync(configPath, configContent);
    console.log('Frontend config updated successfully!');
}

module.exports = { updateFrontendConfig };
