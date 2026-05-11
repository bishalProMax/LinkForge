async function verifyTurnstile(token, ip) {
  try {

    if (!token) {
      return false;
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip,
        }),
      }
    );

    const data = await response.json();

    return data.success;

  } catch (error) {
    console.error(error);

    return false;
  }
}
export default verifyTurnstile;