"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { YouSplit__factory } from "../../hardhat/typechain-types/factories/YouSplit__factory";

export default function Home() {
  const { address: connectedAddress, isConnected } = useAccount();
  const[contract, setContract] = useState<any>(null);
  const[withdrawableAmount, setwithdrawableAmount] = useState<bigint>(BigInt(0));
  const[beneficiaries, setBeneficiaries] = useState<[string, number, number, boolean][]>([]);
  const[royaltyAmount, setRoyaltyAmount] = useState<string>('');
  const[totalFunds, setTotalFunds] = useState<bigint | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!isConnected || !connectedAddress) return;
    
      // Connect to the contract
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.error("Contract address not set");
        return;
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const youSplit = YouSplit__factory.connect(contractAddress, signer);

      setContract(youSplit);

      try {
        // fetch and set beneficiaries
        const[addresses, shares, withdrawn, eligibility] = await youSplit.getBeneficiaries();
        const beneficiariesArray = addresses.map((addr: string, index: number) => [
          addr,
          shares[index],
          withdrawn[index],
          eligibility[index]
        ]);
        setBeneficiaries(beneficiariesArray as [string, number, number, boolean][]);

        // fetch withdrawable amount for the connected address
        const { eligibleAmount } = await youSplit.getBeneficiaryInfo(connectedAddress);
        setwithdrawableAmount(eligibleAmount);

        // fetch total funds
        const totalFunds = await youSplit.getTotalFunds();
        setTotalFunds(totalFunds);

      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    initContract();
  }, [isConnected, connectedAddress]);

  const handleWithdraw = async () => {
    if (!contract) return;
    try {
      const tx = await contract.withdraw();
      await tx.wait();
      alert("Withdrawal successful");
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert("Withdrawal failed. Please Try again.");
    }
  };

  const handleOnramp = async () => {
    if (!contract) return;
    try {
      const amount = ethers.parseUnits(royaltyAmount, 6);
      const tx = await contract.onrampRoyalties(amount);
      await tx.wait();
      alert("Royalties onramped successfully");
      // Optionally, you could refresh the contract balance here or update the UI.
    } catch (error) {
      console.error("Onramping failed", error);
      alert("Onramping failed. Please try again.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black">
      <header className="w-full max-w-2xl mb-8">
        <h1 className="text-4xl font-bold text-center text-black mb-4">YouSplit</h1>
        <div className="flex justify-center mb-4">
          <ConnectButton />
        </div>
        {isConnected && (
          <div className="text-center">
            <p className="text-lg font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        )}
      </header>

      <section className="w-full max-w-md">
        {isConnected && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Contract Balance</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
            <p>Total USDC: {totalFunds !== null ? ethers.formatUnits(totalFunds, 6) : "Loading..."} USDC</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Share</h2>
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <p className="mb-2">Withdrawable Amount: {ethers.formatEther(withdrawableAmount)} ETH</p>
              <button
                onClick={handleWithdraw}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Withdraw
              </button>
            </div>

            {connectedAddress === contract?.owner && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Onramp Royalties</h3>
                <input 
                  type="number" 
                  value={royaltyAmount} 
                  onChange={(e) => setRoyaltyAmount(e.target.value)} 
                  placeholder="Enter amount in USDC" 
                  step="0.000001"
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={handleOnramp}
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Onramp
                </button>
              </div>
            )}

            <h2 className="text-2xl font-semibold mb-4">Beneficiaries</h2>
            <div className="bg-white shadow-md rounded-lg p-6">
              <ul className="space-y-2">
                {beneficiaries.map(([address, shares, withdrawn, isEligible], index) => (
                  <li key={index} className="flex justify-between items-center">
                    <Address address={address} />
                    <span>Shares: {shares}%</span>
                    <span>Withdrawn: {ethers.formatEther(withdrawn)} ETH</span>
                    <span>Eligible: {isEligible ? 'Yes' : 'No'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {!isConnected && (
          <div className="text-center mt-8">
            <p>Please connect your wallet to interact with YouSplit.</p>
          </div>
        )}
      </section>
      </main>
  );
};
