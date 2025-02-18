const { ethers } = require('ethers');
require('dotenv').config();

const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const l1Provider = new ethers.JsonRpcProvider(process.env.L1_RPC);
const EXECUTION_INTERVAL = 20n; // Defines the number of blocks between each task execution

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
 * Find the elected task performer using the Round Robin algorithm
 */
async function electLeaderRoundRobin(blockNumber) {
  const operators = await getActiveOperators(blockNumber);
  const numOfActiveOperators = BigInt(operators.length);
  const selectedIndex = (BigInt(blockNumber) / EXECUTION_INTERVAL % numOfActiveOperators);
  return operators[Number(selectedIndex)].operator;
}

/**
 * Find the elected task performer randomly
 */
async function electRandomLeader(blockNumber) {
  const operators = await getActiveOperators(blockNumber);
  const randomIndex = await getRandomNumber(blockNumber, operators.length);
  return operators[randomIndex].operator;
}

/**
 * Select an operator based on stake-weighted randomization
 */
async function weightedRandom(blockNumber, operators) {
  const totalWeight = operators.reduce((sum, { votingPower }) => sum + BigInt(votingPower), 0n);

  if (totalWeight === 0n) {
    const randomIndex = await getRandomNumber(blockNumber, operators.length);
    return operators[randomIndex].operatorId;
  }

  const randomValue = await getRandomNumber(blockNumber, Number(totalWeight));
  let cumulativeWeight = 0n;
  for (const { operatorId, votingPower } of operators) {
    cumulativeWeight += BigInt(votingPower);
    if (randomValue <= cumulativeWeight) {
      return operatorId;
    }
  }

  throw new Error("Failed to select a weighted random operator");
}

/**
 * Find the elected task performer using stake-weighted randomization
 */
async function electStakeWeighedLeader(blockNumber) {
  console.log("leader election")
  const operators = await getActiveOperators(blockNumber);
  const selectedOperatorId = await weightedRandom(blockNumber, operators);
  const selectedOperator = operators.find((op) => op.operatorId === selectedOperatorId);
  console.log("selected leader", selectedOperator)
  return selectedOperator.operator;
}

/**
 * Helper function to generate a random number
 */
async function getRandomNumber(blockNumber, range) {
  const block = await l1Provider.getBlock("latest");
  console.log("Block Number: ", block.number);
  const prevrandao = BigInt(block.prevRandao);
  console.log("Block prevRandao", prevrandao);
  const randomValue = prevrandao % BigInt(range);
  return Number(randomValue);
}

module.exports = {
  electLeaderRoundRobin,
  electRandomLeader,
  electStakeWeighedLeader,
};
