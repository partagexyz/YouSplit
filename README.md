# YouSplit - Ethereum Smart Contract for YouTube Royalties Distribution

**YouSplit** is an Ethereum smart contract designed to manage and distribute YouTube royalties or similar revenue streams among beneficiaries. It's tailored for creators who wish to automate and track the distribution of their earnings based on predefined shares.

## Overview

- **Project Status:** In Development
- **License:** MIT
- **Contract:**[YouSplit.sol](packages/hardhat/contracts/YouSplit.sol)
- **Frontend:** Next.js application located in the `nextjs` subdirectory

## Features

- **Automated Royalty Distribution**: Automatically calculates and allows for withdrawal of royalties based on predefined shares.
- **Beneficiary Management**: Add, update, or remove beneficiaries with specific share allocations. 
- **Owner Benefits**: The contract owner receives a default share of 5% from the total revenue. (business model)
- **Transparency**: Beneficiaries can view their share, withdrawn amounts, and eligibility status via a user-friendly interface.
- **Security**: Designed with security in mind, though currently lacks some advanced protections like reentrancy guards (can be added).

## Getting Started

### Prerequisites

- Node.js (14.x or later)
- Yarn or npm
- A modern web browser with MetaMask installed
- Hardhat for smart contract development, testing, and deployment

### Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/partagexyz/YouSplit && cd YouSplit
   ```

2. **Install Dependencies:**
    ```
    yarn install
    ```

3. **Setup Environment Variables:**
  - Create a .env file in the root of your project with:
    ```
    NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
    ```

4. **Compile and Deploy Smart Contracts:**
- Ensure you have the appropriate network configuration in hardhat.config.js
- Run:
    ```bash
    yarn deploy
    ```

5. **Start the frontend:**
    ```
    yarn start
    ```
  This will start the Next.js development server, and you can access the app at http://localhost:3000.

6. **Using YouSplit:**
- **Connect Wallet:** Use MetaMask to connect your Ethereum wallet.
- **View Contract Balance:** See the total amount of ETH in the contract.
- **Withdraw Funds:** If you're a beneficiary, you can withdraw your share of the royalties.
- **Manage Beneficiaries:** Contract owner can add, update, or remove beneficiaries from the list.

**License:**
Distributed under the MIT License. See LICENSE for more information.
   