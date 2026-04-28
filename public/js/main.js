function togglePassword(id,btn) {
    const input = document.getElementById(id)
    
    if (input.type === "password") {
        input.type = "text"
        btn.innerText = "Hide"
    } else {
        input.type = "password"
        btn.innerText = "Show"
    }
}
