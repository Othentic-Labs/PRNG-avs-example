const { ethers } = require('ethers');
require('dotenv').config();

const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const l1Provider = new ethers.JsonRpcProvider(process.env.L1_RPC);
const EXECUTION_INTERVAL = 20n; // Defines the number of blocks between each task execution

// The AttestationCenter contract object
const attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
const attestationCenterAbi = [
  "function numOfActiveOperators() view returns (uint256)",
  "function getOperatorPaymentDetail(uint256) view returns (address, uint256, uint256, uint8)",
  "function obls() view returns (address)"
];

const oblsAbi = [
  "function votingPower(uint256) view returns (uint256)",
];

const attestationCenterContract = new ethers.Contract(
  attestationCenterAddress,
  attestationCenterAbi,
  provider
);

/**
 * If your AVS involves significant financial value, prevRandao may not a suitable source of randomness.
 * Consider using VRF or a comparable service that provides verifiable randomness.
 */

async function getRandomNumber(blockNumber, range) {
  const block = await l1Provider.getBlock("latest");
  console.log("Block Number: ", block.number)
  const prevrandao = BigInt(block.prevRandao);
  console.log("Block prevRandao", prevrandao)
  const randomValue = prevrandao % BigInt(range);
  return Number(randomValue);
}

/**
 * Find the elected task performer for a certain block using Round Robin algorithm
 */
async function electedLeaderRoundRobin(blockNumber) {
  const numOfActiveOperators = await attestationCenterContract.numOfActiveOperators({
    blockTag: blockNumber,
  });
  if (numOfActiveOperators === 0) {
    throw new Error("No active operators available");
  }
  const selectedOperatorId = (BigInt(blockNumber)/EXECUTION_INTERVAL % numOfActiveOperators) + 1n;
  const paymentDetails = await attestationCenterContract.getOperatorPaymentDetail(
    selectedOperatorId,
    { blockTag: blockNumber }
  );
  return paymentDetails[0];
}

/**
 * Find the elected task performer randomly
 */
async function electRandomLeader(blockNumber) {
  const numOfActiveOperators = await attestationCenterContract.numOfActiveOperators({
    blockTag: blockNumber,
  });
  if (numOfActiveOperators === 0) {
    throw new Error("No active operators available");
  }
  const selectedOperatorId = await getRandomNumber(blockNumber, numOfActiveOperators) + 1;
  const paymentDetails = await attestationCenterContract.getOperatorPaymentDetail(
    selectedOperatorId,
    { blockTag: blockNumber }
  );
  return paymentDetails[0];
}

async function weightedRandom(blockNumber, stakeWeights) {
  console.log("Staked weights", stakeWeights)
  const totalWeight = stakeWeights.reduce((sum, { weight }) => sum + weight, 0n);

  if (totalWeight === 0n) {
    return await getRandomNumber(blockNumber, Number(stakeWeights.length)) + 1; // Math.floor(Math.random() * Number(stakeWeights.length)) + 1;
  }

  const randomValue = await getRandomNumber(blockNumber, Number(totalWeight));
  let cumulativeWeight = 0n;
  for (const { id, weight } of stakeWeights) {
    cumulativeWeight += weight;
    if (randomValue <= cumulativeWeight) {
      return id;
    }
  }

  throw new Error("Failed to select a weighted random operator");
}


/**
 * Find the elected task performer randomly
 */
async function electStakeWeighedLeader(blockNumber) {
  const count = await attestationCenterContract.numOfActiveOperators({
    blockTag: blockNumber,
  });
  const oblsContractAddress = await attestationCenterContract.obls({
    blockTag: blockNumber,
  });
  const oblsContract = new ethers.Contract(
    oblsContractAddress,
    oblsAbi,
    provider
  );
  if (count === 0) {
    throw new Error("No active operators available");
  }
  const stakePromises = Array.from({ length: Number(count) }, (_, i) =>
    oblsContract.votingPower(i + 1, {
      blockTag: blockNumber,
    }).then((stake) => ({ id: i + 1, weight: BigInt(stake) }))
  );

  const stakeWeights = await Promise.all(stakePromises);
  const selectedOperatorId = await weightedRandom(blockNumber, stakeWeights);
  console.log("selected Operator Id", selectedOperatorId)

  const paymentDetails = await attestationCenterContract.getOperatorPaymentDetail(
    selectedOperatorId,
    { blockTag: blockNumber }
  );
  return paymentDetails[0];
}


module.exports = {
    electedLeader: electedLeaderRoundRobin,
    electRandomLeader,
    electStakeWeighedLeader
}
  