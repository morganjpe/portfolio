import type { SessionStorage } from "remix";
import { Logger } from "~/utils/Logger";

export async function getSessionToken(
  request: Request,
  storage: SessionStorage,
  logger: Logger,
  key: string
) {
  let session = await storage.getSession(request.headers.get("Cookie"));
  let strava = session.get(key);
  if (!strava || typeof strava !== "string") {
    logger.log("session not found");
    return null;
  }
  return strava;
}
