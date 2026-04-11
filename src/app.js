const express = require("express")
const urlRoute = require("./routes/url.route.js")
const app = express()

app.use(express.json())
app.use("/url",urlRoute)

module.exports = app