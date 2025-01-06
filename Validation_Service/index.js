"use strict";
const app = require("./configs/app.config")
const PORT = process.env.port || process.env.PORT || 4002

app.listen(PORT, () => console.log("Server started on port:", PORT))