//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/// @title YouSplit
/// @author jcarbonnell (partage.xyz)
/// @notice An ethereum smart contract to split YouTube royalties between a bunch of beneficiaries.

contract YouSplit {
	// State Variables
	address public immutable owner;
	uint256 public totalShares;
	uint256 public totalBalance;

	struct Beneficiary {
		uint256 shares;
		uint256 withdrawn;
		bool isEligible;
	}

	mapping(address => Beneficiary) public beneficiaries;

	// Events: a way to emit log statements from smart contract that can be listened to by external parties
	event ContractFunded(address indexed sender, uint256 amount);
    event BeneficiaryAdded(address indexed beneficiary, uint256 shares);
    event BeneficiaryUpdated(address indexed beneficiary, uint256 newShares, bool newEligibility);
	event BeneficiaryDeleted(address indexed beneficiary);
	event Withdrawal(address indexed beneficiary, uint256 amount);

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address[] memory _beneficiaries, uint256[] memory _shares) {
		require(_beneficiaries.length == _shares.length, "Must provide equal number of beneficiaries and shares.");
		owner = msg.sender;
		totalShares = 100;

		// Ensure the onwer gets 5% of the total shares
		uint256 ownerShares = 5;
		beneficiaries[owner] = Beneficiary({
			shares: ownerShares, 
			withdrawn: 0, 
			isEligible: true
		});
		emit BeneficiaryAdded(owner, ownerShares);

		// Add the rest of the beneficiaries
		uint256 remainingShares = 95;
		for (uint i = 0; i < _beneficiaries.length; i++) {
			uint256 sharePercentage = (_shares[i] * remainingShares) / 100;
			beneficiaries[_beneficiaries[i]] = Beneficiary({
				shares: sharePercentage, 
				withdrawn: 0, 
				isEligible: true
			});
			emit BeneficiaryAdded(_beneficiaries[i], sharePercentage);
		}
	}

	// Function to receive ETH
	receive() external payable {
		totalBalance += msg.value;
		emit ContractFunded(msg.sender, msg.value);
	}

	// Function to check balance and eligibility
	function getBeneficiaryInfo(address _beneficiary) public view returns (uint256 shares, uint256 withdrawn, uint256 eligibleAmount, bool isEligible) {
		Beneficiary memory beneficiary = beneficiaries[_beneficiary];
		uint256 sharePercentage = beneficiary.shares * 100 / totalShares;
		return (beneficiary.shares, beneficiary.withdrawn, (totalBalance * sharePercentage) / 100, beneficiary.isEligible);
	}

	// Function to withdraw funds
	function withdraw() public {
		Beneficiary storage beneficiary = beneficiaries[msg.sender];
		require(beneficiary.isEligible, "You are not eligible to withdraw.");
		uint256 sharePercentage = beneficiary.shares * 100 / totalShares;
		uint256 amount = (totalBalance * sharePercentage) / 100 - beneficiary.withdrawn;
		
		require(amount > 0, "You have no funds to withdraw.");
		beneficiary.withdrawn += amount;
		totalBalance -= amount;
		payable(msg.sender).transfer(amount);
		emit Withdrawal(msg.sender, amount);
	}

	// Function to add or update beneficiary
	function setBeneficiary(address _beneficiary, uint256 _shares, bool _isEligible) public {
		require(msg.sender == owner, "Only the owner can add or update beneficiaries.");
		if (_beneficiary != owner) {
			if(beneficiaries[_beneficiary].shares > 0) {
				totalShares -= beneficiaries[_beneficiary].shares;
			}
			beneficiaries[_beneficiary] = Beneficiary({
				shares: _shares, 
				withdrawn: 0, 
				isEligible: _isEligible
			});
			totalShares += _shares;
			emit BeneficiaryAdded(_beneficiary, _shares);
		}
	}

	// Function to remove beneficiary
	function removeBeneficiary(address _beneficiary) public {
		require(msg.sender == owner, "Only the owner can remove beneficiaries.");
		require(_beneficiary != owner, "You cannot remove the owner.");
		totalShares -= beneficiaries[_beneficiary].shares;
		delete beneficiaries[_beneficiary];
		emit BeneficiaryDeleted(_beneficiary);
	}

	// Function to get total funds in the contract
	function getTotalFunds() public view returns (uint256) {
		return address(this).balance;
	}
}