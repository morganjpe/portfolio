import { Logger } from "../../Logger";

export type HttpOptions = Record<string, string>;

export interface HttpClientOptions {
  baseUrl: string;
  logger: Logger;
  headers?: HttpOptions;
}

export class HttpClient {
  private _baseUrl: string;
  private _headers: HttpOptions;
  protected _logger: Logger;

  constructor(options: HttpClientOptions) {
    this._baseUrl = options.baseUrl;
    this._headers = options.headers || {};
    this._logger = options.logger;
  }

  private async fetchJson<T>(
    endpoint: string,
    options?: HttpOptions
  ): Promise<T | null> {
    const response = await fetch(`${this._baseUrl}/${endpoint}`, {
      headers: this._headers,
      ...options,
    });

    if (!response.ok) {
      const error = JSON.stringify({
        message: response.statusText,
        endpoint: `${this._baseUrl}/${endpoint}`,
      });

      this._logger.log(error);
    }

    if (response.status !== 204) {
      const data = await response.json();
      return data;
    }

    return null;
  }

  get<T>(endpoint: string, options?: { [key: string]: HttpOptions }) {
    return this.fetchJson<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  post<T>(
    endpoint: string,
    body: HttpOptions,
    options?: { [key: string]: HttpOptions }
  ) {
    console.log(body);
    console.log({ ...options });

    return this.fetchJson<T>(endpoint, {
      ...options,
      body: JSON.stringify(body),
      method: "POST",
    });
  }
}
