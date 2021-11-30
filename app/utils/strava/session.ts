import dayjs from "dayjs";
import { createCookieSessionStorage, Session } from "remix";
import { StravaAPI } from "../http/StravaAPI";
import { Logger } from "../Logger";

let sessionSecret = process.env.STRAVA_CLIENT_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export interface StravaYearToDateTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
}

export interface AthleteDataResponse {
  data?: StravaYearToDateTotals;
  error?: string;
}

const STRAVA_KEY = "strava";

const storage = createCookieSessionStorage({
  cookie: {
    name: "access_token",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    expires: dayjs().add(5, "hour").toDate(),
  },
});

const StravaLogger = new Logger("strava logger");

const StravaApi = new StravaAPI({
  baseUrl: "https://www.strava.com",
  logger: StravaLogger,
});

export async function getStravaAccessToken(request: Request) {
  let session = await storage.getSession(request.headers.get("Cookie"));
  let strava = session.get(STRAVA_KEY);
  if (!strava || typeof strava !== "string") {
    StravaLogger.log("session not found");
    return null;
  }
  return strava;
}

const createStravaSession = async () => {
  const response = await StravaApi.createStravaAccessToken<{
    access_token: string;
  }>();

  if (!response) {
    StravaLogger.log("no response for access token");
    return null;
  }

  const session = await storage.getSession();
  session.set(STRAVA_KEY, response.access_token);

  return session;
};

export const getStravaAthleteData = async (request: Request) => {
  let token: string | null = await getStravaAccessToken(request);
  let session: Session | null = null;

  if (!token) {
    StravaLogger.log("no initial token");
    session = await createStravaSession();
  }

  if (session) {
    token = session.get(STRAVA_KEY);
  }

  const athleteDataResponse = await StravaApi.getAthleteData<{
    ytd_run_totals: StravaYearToDateTotals;
  }>(token as string);

  if (athleteDataResponse) {
    const { ytd_run_totals } = athleteDataResponse;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session) {
      headers["Set-Cookie"] = await storage.commitSession(session);
    }

    return new Response(JSON.stringify({ data: ytd_run_totals }), {
      headers,
    });
  }

  StravaLogger.log("no athlete data response");
  return null;
};
