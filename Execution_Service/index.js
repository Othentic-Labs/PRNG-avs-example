"use strict";
const app = require("./configs/app.config")
const leaderElectionService = require("./src/leaderElection");
const dalService = require("./src/dal.service");
const { ethers } = require('ethers');

dalService.init();
const rpcUrl = process.env.L2_RPC;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks

provider.on("block", async (blockNumber) => {
    if (blockNumber % 20 == 0) {
      // Every operator knows who is supposed to send a task in the next block
      const currentPerformer = await leaderElectionService.electedLeader(blockNumber);
  
      // If the current performer is the operator itself, it performs the task
      if (currentPerformer === nodeAccount.address) {
        console.log(`Performing task for block ${blockNumber}...`);
        const proofOfTask = `${blockNumber}+${Date.now()}`;
        const taskDefinitionId = 0;
        const data = ethers.hexlify(ethers.toUtf8Bytes("hello world"));
        await dalService.sendTask(proofOfTask, data, taskDefinitionId);
      }
    }
});
  
const PORT = process.env.port || process.env.PORT || 4003

app.listen(PORT, () => console.log("Server started on port:", PORT))