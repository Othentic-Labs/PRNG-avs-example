require('dotenv').config();
const { ethers, Interface } = require('ethers');
const dalService = require("./dal.service");
const leaderElectionService = require("./leaderElection.service");

const WS_RPC_URL = process.env.WS_RPC_URL;
const provider = new ethers.WebSocketProvider(WS_RPC_URL);

const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const eventSignature = "UserOperationEvent(bytes32,address,address,uint256,bool,uint256,uint256)";
const topic = ethers.keccak256(ethers.toUtf8Bytes(eventSignature)); 

/**
 * This filter could also be generated with the Contract or  Interface API. If address is not specified, any address
 * matches and if topics is not specified, any log matches
 */

const filter = {
    address: CONTRACT_ADDRESS,
    topics: [topic]
};


// Create an interface instance for decoding the Topic data
const eventABI = ["event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed)"];
const iface = new Interface(eventABI)

function performTask(log) {
    try {
        decodedEvent = iface.parseLog({data: log.data, topics: log.topics});
        console.log("Decoded Event Data:");
        console.log(decodedEvent.args);
    } catch (error) {
        console.error("Failed to decode event log:", error);
    }
    // Add your task execution logic here.
    return `${log.blockNumber}+${Date.now()}`;
}

/**
 * This function triggers a task based on an event in a specific contract
*/

function start() {
    console.log("Starting polling...")
    provider.on(filter, async(log) => {
        const currentPerformer = await leaderElectionService.electLeaderRoundRobin(log.blockNumber);
        console.log("Elected Operator", currentPerformer)

        console.log(`
            ========================================
            Event Emitted:
            ----------------------------------------
            Transaction Hash   : ${log.transactionHash}
            Transaction Index  : ${log.transactionIndex}
            Block Number       : ${log.blockNumber}
            Block Hash         : ${log.blockHash}
            Contract Address   : ${log.address}
            Data               : ${log.data}
            Topics             : ${log.topics.join(', ')}
            ========================================
        `);

        if (currentPerformer === nodeAccount.address) {
            const proofOfTask = performTask(log);
            const taskDefinitionId = 0;
            const data = ethers.hexlify(ethers.toUtf8Bytes("hello world"));
            await dalService.sendTask(proofOfTask, data, taskDefinitionId);
        }
    });
}

module.exports = { start };
