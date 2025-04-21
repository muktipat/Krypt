import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import useFetch from "../hooks/useFetch";
import { shortenAddress } from "../utils/shortenAddress";

// Define dummy transactions directly here:
const dummyData = [
  {
    addressTo: "0x525572b6818C2886Ba27956E15f3fcE2404EAa8C",
    addressFrom: "0xF8bbd2c71b3EEB37e753215763d4aDe4D57b6e25",
    timestamp: "2024-04-25 12:00:00",
    message: "Hello from dummy!",
    keyword: "cat",
    amount: 0.01,
    url: ""
  },
  {
    addressTo: "0x525572b6818C2886Ba27956E15f3fcE2404EAa8C",
    addressFrom: "0xF8bbd2c71b3EEB37e753215763d4aDe4D57b6e25",
    timestamp: "2024-04-24 16:30:00",
    message: "Second dummy transaction",
    keyword: "dog",
    amount: 0.05,
    url: ""
  },
  {
    addressTo: "0x525572b6818C2886Ba27956E15f3fcE2404EAa8C",  
    addressFrom: "0xF8bbd2c71b3EEB37e753215763d4aDe4D57b6e25",
    timestamp: "2024-04-23 09:15:00",
    message: "Enjoy your ETH!",
    keyword: "rocket",
    amount: 0.2,
    url: ""
  }
];

const TransactionsCard = ({
  addressTo,
  addressFrom,
  timestamp,
  message,
  keyword,
  amount,
  url
}) => {
  const gifUrl = useFetch({ keyword });

  return (
    <div className="bg-[#181918] m-4 flex flex-1
      2xl:min-w-[450px]
      2xl:max-w-[500px]
      sm:min-w-[270px]
      sm:max-w-[300px]
      min-w-full
      flex-col p-3 rounded-md hover:shadow-2xl"
    >
      <div className="flex flex-col items-center w-full mt-3">
        <div className="w-full mb-6 p-2 space-y-2">
          <div className="flex justify-between">
            <a
              href={`https://sepolia.etherscan.io/address/${addressFrom}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              From: {shortenAddress(addressFrom)}
            </a>
            <a
              href={`https://sepolia.etherscan.io/address/${addressTo}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              To: {shortenAddress(addressTo)}
            </a>
          </div>
          <p className="text-white">Amount: {amount} ETH</p>
          {message && <p className="text-gray-400">Message: {message}</p>}
        </div>
        <img
          src={gifUrl || url || "https://metro.co.uk/wp-content/uploads/2015/05/pokemon_crying.gif"}
          alt="transaction visual"
          className="w-full h-64 object-cover rounded-md"
          onError={(e) => {
            e.target.src = "https://metro.co.uk/wp-content/uploads/2015/05/pokemon_crying.gif";
          }}
        />
        <div className="bg-black p-2 mt-3 rounded-full">
          <p className="text-[#37c7da] text-sm">{timestamp}</p>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { transactions, currentAccount } = useContext(TransactionContext);

  return (
    <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions">
      <div className="flex flex-col md:p-12 py-12 px-4 w-full max-w-6xl">
        <h3 className="text-white text-3xl text-center my-2">
          {currentAccount ? "Latest Transactions" : "Connect your wallet"}
        </h3>

        <div className="flex flex-wrap justify-center items-center mt-10 gap-4">
          {[...dummyData, ...(transactions || [])].reverse().map((transaction, i) => (
            <TransactionsCard
              key={`${transaction.timestamp}-${i}`}
              {...transaction}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
