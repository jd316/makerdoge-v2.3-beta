import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Button,
  Input,
  Text,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  Box,
} from '@chakra-ui/react';
import { ethers } from 'ethers';

function VaultActions({ account, provider, vault, wdoge, vaultInfo, setVaultInfo }) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchVaultInfo = async () => {
      if (vault && account) {
        try {
          const info = await vault.getVaultInfo(account);
          setVaultInfo({
            collateral: ethers.utils.formatEther(info.collateral),
            debt: ethers.utils.formatEther(info.debt),
          });
        } catch (error) {
          console.error('Error fetching vault info:', error);
        }
      }
    };

    fetchVaultInfo();
  }, [vault, account]);

  const handleDeposit = async () => {
    try {
      const signer = provider.getSigner();
      const amount = ethers.utils.parseEther(depositAmount);

      // Approve WDOGE spending
      const approveTx = await wdoge.connect(signer).approve(vault.address, amount);
      await approveTx.wait();

      // Deposit WDOGE
      const tx = await vault.connect(signer).deposit(amount);
      await tx.wait();

      // Clear input and refresh vault info
      setDepositAmount('');
      const info = await vault.getVaultInfo(account);
      setVaultInfo({
        collateral: ethers.utils.formatEther(info.collateral),
        debt: ethers.utils.formatEther(info.debt),
      });

      toast({
        title: "Success",
        description: `Deposited ${depositAmount} WDOGE`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error depositing:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWithdraw = async () => {
    try {
      const signer = provider.getSigner();
      const amount = ethers.utils.parseEther(withdrawAmount);

      const tx = await vault.connect(signer).withdraw(amount);
      await tx.wait();

      // Clear input and refresh vault info
      setWithdrawAmount('');
      const info = await vault.getVaultInfo(account);
      setVaultInfo({
        collateral: ethers.utils.formatEther(info.collateral),
        debt: ethers.utils.formatEther(info.debt),
      });

      toast({
        title: "Success",
        description: `Withdrawn ${withdrawAmount} WDOGE`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBorrow = async () => {
    try {
      const signer = provider.getSigner();
      const amount = ethers.utils.parseEther(borrowAmount);

      const tx = await vault.connect(signer).borrow(amount);
      await tx.wait();

      // Clear input and refresh vault info
      setBorrowAmount('');
      const info = await vault.getVaultInfo(account);
      setVaultInfo({
        collateral: ethers.utils.formatEther(info.collateral),
        debt: ethers.utils.formatEther(info.debt),
      });

      toast({
        title: "Success",
        description: `Borrowed ${borrowAmount} USDm`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error borrowing:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRepay = async () => {
    try {
      const signer = provider.getSigner();
      const amount = ethers.utils.parseEther(repayAmount);

      const tx = await vault.connect(signer).repay(amount);
      await tx.wait();

      // Clear input and refresh vault info
      setRepayAmount('');
      const info = await vault.getVaultInfo(account);
      setVaultInfo({
        collateral: ethers.utils.formatEther(info.collateral),
        debt: ethers.utils.formatEther(info.debt),
      });

      toast({
        title: "Success",
        description: `Repaid ${repayAmount} USDm`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error repaying:', error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={6} width="100%" maxW="600px">
      <Box width="100%" p={4} borderWidth="1px" borderRadius="lg">
        <VStack spacing={4}>
          <Stat>
            <StatLabel>Collateral (WDOGE)</StatLabel>
            <StatNumber>{parseFloat(vaultInfo.collateral).toFixed(4)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Debt (USDm)</StatLabel>
            <StatNumber>{parseFloat(vaultInfo.debt).toFixed(4)}</StatNumber>
          </Stat>
        </VStack>
      </Box>

      <VStack width="100%" spacing={4}>
        <HStack width="100%">
          <Input
            placeholder="Amount of WDOGE"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <Button colorScheme="green" onClick={handleDeposit}>
            Deposit
          </Button>
        </HStack>

        <HStack width="100%">
          <Input
            placeholder="Amount of WDOGE"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Button colorScheme="red" onClick={handleWithdraw}>
            Withdraw
          </Button>
        </HStack>

        <HStack width="100%">
          <Input
            placeholder="Amount of USDm"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleBorrow}>
            Borrow
          </Button>
        </HStack>

        <HStack width="100%">
          <Input
            placeholder="Amount of USDm"
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.target.value)}
          />
          <Button colorScheme="purple" onClick={handleRepay}>
            Repay
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}

export default VaultActions;
