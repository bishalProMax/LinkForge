// GLOBAL ERROR HANDLER
const errorHandler = (err, req, res, next) => {
    console.error("ERROR:", err)
    res.status(500).send("Internal Server Error")
}

// 404 HANDLER
const notFound = (req, res) => {
    res.status(404).send("Page not found")
}


module.exports = {errorHandler, notFound}