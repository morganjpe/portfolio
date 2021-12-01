import dayjs from "dayjs";
import { createCookieSessionStorage, Session } from "remix";
import { StravaAPI } from "../http/StravaAPI";
import { Logger } from "../Logger";
import { getSessionToken } from "../session";

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
  let token: string | null = await getSessionToken(
    request,
    storage,
    StravaLogger,
    STRAVA_KEY
  );
  let session: Session | null = null;
  let cookie: string | null = null;

  if (!token) {
    StravaLogger.log("no initial token");
    session = await createStravaSession();
  }

  if (session) {
    token = session.get(STRAVA_KEY);
    cookie = await storage.commitSession(session);
  }

  const athleteDataResponse = await StravaApi.getAthleteData<{
    ytd_run_totals: StravaYearToDateTotals;
  }>(token as string);

  return {
    body: athleteDataResponse ? athleteDataResponse.ytd_run_totals : null,
    cookie,
  };
};
