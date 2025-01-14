const { ethers } = require('ethers');
require('dotenv').config();

const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);

// The AttestationCenter contract object
const attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
const attestationCenterAbi = [
  "function numOfActiveOperators() view returns (uint256)",
  "function getOperatorPaymentDetail(uint256) view returns (address, uint256, uint256, uint8)",
];
const attestationCenterContract = new ethers.Contract(
  attestationCenterAddress,
  attestationCenterAbi,
  provider
);

/**
 * Find the elected task performer for a certain block
 */
async function electedLeader(blockNumber) {
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


module.exports = {
    electedLeader,
}
  