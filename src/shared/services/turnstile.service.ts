/*eslint-disable no-unused-vars */
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
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
          secret: process.env.TURNSTILE_SECRET_KEY as string,
          response: token,
          remoteip: ip,
        }),
      }
    );
    const data = await response.json();
    return data.success;

  } catch (error) {
    return false;
  }
}
export default verifyTurnstile;