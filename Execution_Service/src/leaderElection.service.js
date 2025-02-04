const { ethers } = require('ethers');
require('dotenv').config();

const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);

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

async function getRandomNumber(blockNumber, range) {
  // Fetch the block details
  const block = await provider.getBlock(blockNumber);
  console.log("Block: ", block.prevRandao)
  const prevrandao = block.prevrandao ? BigInt(block.prevrandao) : 0n;
  console.log("prevrandao", prevrandao)

  const randomValue = prevrandao % BigInt(range);
  return Number(randomValue);
}

/**
 * Find the elected task performer for a certain block using Round Robin algorithm
 */
async function electedLeaderRoundRobin(blockNumber) {
  const count = await attestationCenterContract.numOfActiveOperators({
    blockTag: blockNumber,
  });
  const selectedOperatorId = (BigInt(blockNumber)/20n % count) + 1n;
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
  const count = await attestationCenterContract.numOfActiveOperators({
    blockTag: blockNumber,
  });
  if (count === 0) {
    throw new Error("No active operators available");
  }
  const selectedOperatorId = await getRandomNumber(blockNumber, count) + 1;
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
  