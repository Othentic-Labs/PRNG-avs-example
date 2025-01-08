"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const leaderElectionService = require("./leaderElection.service");

const router = Router()

router.post("/validate", async (req, res) => {
    var proofOfTask = req.body.proofOfTask;
    console.log(`Validate task: proof of task: ${proofOfTask}`);
    try {
        const { proofOfTask, performer } = req.body;
        const blockNumber = parseInt(proofOfTask.split("+")[0], 10); // Extract the block number from the proof of task
        const electedPerformer = await leaderElectionService.electedLeader(blockNumber); // Get the elected performer for that block
    
        console.log(
            `Validating task for block number: ${blockNumber}, Task Performer: ${performer}, Elected Performer: ${electedPerformer}`
        );
    
        let isValid = performer === electedPerformer; // Verify the performer is the elected performer
        console.log('Vote:', isValid ? 'Approve' : 'Not Approved');
        return res.status(200).send(new CustomResponse(isValid));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }

   
})

module.exports = router
