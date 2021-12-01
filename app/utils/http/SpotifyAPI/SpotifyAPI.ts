import { HttpClient, HttpClientOptions } from "../HttpClient";

export class SpotifyAPI extends HttpClient {
  private _auth = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;

  constructor(options: HttpClientOptions) {
    super(options);
  }

  async getAccessToken<T>(): Promise<T | null> {
    const headers = {
      Authorization: `Basic ${Buffer.from(this._auth).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const body = {
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN || "",
    };

    return this.post<T>("api/token", new URLSearchParams(body).toString(), {
      headers,
    });
  }
}
