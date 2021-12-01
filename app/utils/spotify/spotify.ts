import { createCookieSessionStorage, Session } from "remix";
import dayjs from "dayjs";
import SpotifyWebApi from "spotify-web-api-node";

import { SpotifyAPI } from "../http/SpotifyAPI";
import { Logger } from "../Logger";
import { getSessionToken } from "../session";

let sessionSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (!sessionSecret) {
  throw new Error("SPOTIFY_CLIENT_SECRET must be set");
}

export interface SpotifyDataResponse {
  error?: string;
  data?: {
    progress_ms: number;
    item: {
      name: string;
      duration_ms: number;
      href: string;
      preview_url: string;
    };
  };
}

const SPOTIFY_KEY = "spotify";

const storage = createCookieSessionStorage({
  cookie: {
    name: "spotify_access_token",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    expires: dayjs().add(5, "m").toDate(),
  },
});

const spotifyLogger = new Logger("Spotify Logger");

const SpotifyApi = new SpotifyAPI({
  baseUrl: "https://accounts.spotify.com",
  logger: spotifyLogger,
});

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:3000",
});

interface SpotifyAccessTokenResponse {
  access_token: string;
}

const createSpotifySession = async () => {
  const response =
    await SpotifyApi.getAccessToken<SpotifyAccessTokenResponse>();

  if (!response) {
    spotifyLogger.log("unable to get access token");
    return null;
  }

  const session = await storage.getSession();
  session.set(SPOTIFY_KEY, response.access_token);

  return session;
};

export const getSpotifyData = async (request: Request) => {
  let token = await getSessionToken(
    request,
    storage,
    spotifyLogger,
    SPOTIFY_KEY
  );
  let session: Session | null = null;
  let cookie: string | null = null;

  if (!token) {
    session = await createSpotifySession();
  }

  if (session) {
    token = session.get(SPOTIFY_KEY) || "";
    cookie = await storage.commitSession(session);
  }

  spotify.setAccessToken(token as string);
  const currentPlaybackState = await spotify.getMyCurrentPlaybackState();
  const { body, statusCode } = currentPlaybackState;

  return {
    body: statusCode !== 204 ? body : null,
    cookie,
  };
};
