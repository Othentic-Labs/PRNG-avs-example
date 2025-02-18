require('dotenv').config();
const { ethers } = require('ethers');
const leaderElectionService = require("./leaderElection.service");
const dalService = require("./dal.service");

const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks
const EXECUTION_INTERVAL = 20; // Defines the number of blocks between each task execution

function performTask(blockNumber) {
    // Add your task execution logic here.
    console.log(`Performing task for block ${blockNumber}...`);
    return `${blockNumber}+${Date.now()}`;
}
function start() {
    provider.on("block", async (blockNumber) => {
        if (blockNumber % EXECUTION_INTERVAL == 0) {
        // Every operator knows who is supposed to send a task in the next block
        const currentPerformer = await leaderElectionService.electLeaderRoundRobin(blockNumber);
        console.log("Elected Operator", currentPerformer)
    
        // If the current performer is the operator itself, it performs the task
        if (currentPerformer === nodeAccount.address) {
            const proofOfTask = performTask(blockNumber);
            const taskDefinitionId = 0;
            const data = ethers.hexlify(ethers.toUtf8Bytes("hello world"));
            await dalService.sendTask(proofOfTask, data, taskDefinitionId);
        }
        }
    });
}

module.exports = { start };
