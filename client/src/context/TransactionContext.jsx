import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({
    addressTo: "", 
    amount: "", 
    keyword: "", 
    message: ""
  });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount") || 0
  );
  const [transactions, setTransactions] = useState(
    JSON.parse(localStorage.getItem("transactions")) || []
  );

  const handleChange = (e, name) => {
    setformData(prev => ({ ...prev, [name]: e.target.value }));
  };

  // Enhanced transaction fetcher with logging
  const getAllTransactions = useCallback(async () => {
    try {
      if (!ethereum) {
        console.log("Ethereum object not found");
        return;
      }
      
      const transactionsContract = createEthereumContract();
      console.log("Fetching transactions from contract:", contractAddress);
      const availableTransactions = await transactionsContract.getAllTransactions();
      console.log("Raw transactions from contract:", availableTransactions);

      const structuredTransactions = availableTransactions.map((tx) => ({
        addressTo: tx.receiver,
        addressFrom: tx.sender,
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        message: tx.message,
        keyword: tx.keyword,
        amount: Number(ethers.utils.formatEther(tx.amount)),
      }));
      
      console.log("Structured transactions:", structuredTransactions);
      localStorage.setItem("transactions", JSON.stringify(structuredTransactions));
      setTransactions(structuredTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, []);

  // Network verification
  const checkNetwork = async () => {
    try {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (chainId !== "0xaa36a7") { // Sepolia chain ID
        console.log("Wrong network, please connect to Sepolia");
        alert("Please connect to Sepolia network");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Network check failed:", error);
      return false;
    }
  };

  const checkIfWalletIsConnect = useCallback(async () => {
    try {
      if (!ethereum) return;
      if (!(await checkNetwork())) return;
      
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        await getAllTransactions();
      }
    } catch (error) {
      console.error("Wallet connection check failed:", error);
    }
  }, [getAllTransactions]);

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask");
      if (!(await checkNetwork())) return;

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      await getAllTransactions();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const sendTransaction = async () => {
    try {
      if (!(await checkNetwork())) return;
      
      const { addressTo, amount, keyword, message } = formData;
      const transactionsContract = createEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      setIsLoading(true);
      
      // Send ETH to receiver
      const txResponse = await ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: currentAccount,
          to: addressTo,
          gas: "0x5208", // 21000 GWEI
          value: parsedAmount._hex,
        }],
      });
      console.log(`Transaction hash: ${txResponse}`);

      // Record transaction in smart contract
      const tx = await transactionsContract.addToBlockchain(
        addressTo, 
        parsedAmount, 
        message, 
        keyword
      );
      
      console.log(`Waiting for transaction ${tx.hash} to be mined...`);
      await tx.wait();
      console.log(`Transaction mined: ${tx.hash}`);
      
      // Refresh data
      const txCount = await transactionsContract.getTransactionCount();
      setTransactionCount(txCount.toNumber());
      localStorage.setItem("transactionCount", txCount.toString());
      
      // Force refresh transactions
      await getAllTransactions();
      setIsLoading(false);
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsLoading(false);
    }
  };

  // Properly set up event listener with cleanup
  // Properly set up event listener with cleanup
useEffect(() => {
  if (!ethereum) return;
  
  const contract = createEthereumContract();
  console.log("Setting up Transfer event listener");
  
  // Event listener that matches your contract's Transfer event signature
  const transferHandler = (from, receiver, amount, message, timestamp, keyword) => {
    console.log("Transfer event detected:", { 
      from, 
      receiver, 
      amount: ethers.utils.formatEther(amount) 
    });
    getAllTransactions();
  };

  contract.on("Transfer", transferHandler);
  
  return () => {
    console.log("Removing Transfer event listener");
    contract.off("Transfer", transferHandler);
  };
}, [getAllTransactions]);



  // Initial setup
  useEffect(() => {
    checkIfWalletIsConnect();
  }, [checkIfWalletIsConnect]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
