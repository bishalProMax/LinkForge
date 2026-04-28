
const handleShowSignupPage = (req, res) => {
    res.render("signup")
}
const handleShowLoginPage = (req, res) => {
    res.render("login", { error: null })
}

module.exports = {
    handleShowSignupPage,
    handleShowLoginPage
}
