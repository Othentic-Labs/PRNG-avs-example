"use strict";
const app = require("./configs/app.config")
const dalService = require("./src/dal.service");
const taskPerformer = require("./src/task.controller");
const eventTriggeredTaskPerformer = require("./src/event.trigger.task.controller");
const { init } = require("./src/utils/mcl");

const PORT = process.env.port || process.env.PORT || 4003;

(async () => {
    dalService.init();
    await init();
    // Start the task performer
    taskPerformer.start();
    eventTriggeredTaskPerformer.start();
    app.listen(PORT, () => console.log("Server started on port:", PORT))
})();