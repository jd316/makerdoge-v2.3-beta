import React from 'react';
import { Button, Text, HStack } from '@chakra-ui/react';

function ConnectWallet({ account, setAccount, provider }) {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <HStack spacing={4}>
      {account ? (
        <Text>Connected: {account.slice(0, 6)}...{account.slice(-4)}</Text>
      ) : (
        <Button colorScheme="blue" onClick={connectWallet}>
          Connect Wallet
        </Button>
      )}
    </HStack>
  );
}

export default ConnectWallet;
