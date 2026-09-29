import { AccessToken } from "livekit-server-sdk";

export async function roomToken(room, identity) {
  try {
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity,
      ttl: "1h",
    });
    token.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
    return await token.toJwt();
  } catch (error) {
    throw new Error(`Failed to generate LiveKit room access token: ${error?.message || error}`);
  }
}
