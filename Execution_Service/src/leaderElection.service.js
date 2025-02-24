const { ethers } = require('ethers');
require('dotenv').config();

const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const l1Provider = new ethers.JsonRpcProvider(process.env.L1_RPC);

// The AttestationCenter contract object
const attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
const attestationCenterAbi = [
  "function getActiveOperatorsDetails() view returns (tuple(address operator, uint256 operatorId, uint256 votingPower)[])"
];

const attestationCenterContract = new ethers.Contract(
  attestationCenterAddress,
  attestationCenterAbi,
  provider
);

/**
 * Fetch all active operator details
 */
async function getActiveOperators(blockNumber) {
  const operators = await attestationCenterContract.getActiveOperatorsDetails({
    blockTag: blockNumber,
  });
  if (operators.length === 0) {
    throw new Error("No active operators available");
  }
  return operators;
}


/**
 * Helper function to select an operator based on stake-weighted randomization
 */
async function weightedRandom(operators) {
  const sortedOperators = [...operators].sort((a, b) => Number(BigInt(b.votingPower) - BigInt(a.votingPower)));
  const totalWeight = sortedOperators.reduce((sum, { votingPower }) => sum + BigInt(votingPower), 0n);

  if (totalWeight === 0n) {
    const randomIndex = await getRandomNumber(sortedOperators.length);
    return sortedOperators[randomIndex].operatorId;
  }

  const randomValue = await getRandomNumber(Number(totalWeight));
  let cumulativeWeight = 0n;
  for (const { operatorId, votingPower } of sortedOperators) {
    cumulativeWeight += BigInt(votingPower);
    if (randomValue <= cumulativeWeight) {
      return operatorId;
    }
  }

  throw new Error("Failed to select a weighted random operator");
}

/**
 * Helper function to generate a random number
 */
async function getRandomNumber(range) {
  const block = await l1Provider.getBlock("latest");
  console.log("Block Number: ", block.number);
  const prevrandao = BigInt(block.prevRandao);
  console.log("Block prevRandao", prevrandao);
  const randomValue = prevrandao % BigInt(range);
  return Number(randomValue);
}

/**
 * Find the elected task performer using the Round Robin algorithm
 */
async function electLeaderRoundRobin(blockNumber) {
  const operators = await getActiveOperators(blockNumber);
  const numOfActiveOperators = BigInt(operators.length);
  const selectedIndex = BigInt(blockNumber) % numOfActiveOperators;
  return operators[Number(selectedIndex)].operator;
}

/**
 * Find the elected task performer randomly
 */
async function electRandomLeader(blockNumber) {
  const operators = await getActiveOperators(blockNumber);
  const randomIndex = await getRandomNumber(operators.length);
  return operators[randomIndex].operator;
}

/**
 * Find the elected task performer using stake-weighted randomization
 */
async function electStakeWeighedLeader(blockNumber) {
  const operators = await getActiveOperators(blockNumber);
  const selectedOperatorId = await weightedRandom(operators);
  const selectedOperator = operators.find((op) => op.operatorId === selectedOperatorId);
  return selectedOperator.operator;
}

module.exports = {
  electLeaderRoundRobin,
  electRandomLeader,
  electStakeWeighedLeader,
};
