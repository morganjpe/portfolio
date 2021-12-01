import { HttpClient, HttpClientOptions } from "../HttpClient";

export class StravaAPI extends HttpClient {
  constructor(options: HttpClientOptions) {
    super(options);
  }

  createStravaAccessToken<T>() {
    return this.post<T>(
      "oauth/token",
      JSON.stringify({
        grant_type: "refresh_token",
        client_id: process.env.STRAVA_CLIENT_ID || "",
        client_secret: process.env.STRAVA_CLIENT_SECRET || "",
        refresh_token: process.env.STRAVA_REFRESH_TOKEN || "",
      }),
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
  }

  getAthleteData<T>(accessToken: string) {
    return this.get<T>("api/v3/athletes/40972782/stats", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
