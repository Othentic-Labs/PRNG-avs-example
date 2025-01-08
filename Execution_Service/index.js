"use strict";
const app = require("./configs/app.config")
const dalService = require("./src/dal.service");
const taskPerformer = require("./src/task.controller");

dalService.init();

// Start the task performer
taskPerformer.start();

const PORT = process.env.port || process.env.PORT || 4003

app.listen(PORT, () => console.log("Server started on port:", PORT))