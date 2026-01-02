import { UserMetadata, UserRole } from "@/features/users/server/user-types";

const MIN_TTL_SECONDS = 10;
type jwkPayloadType = {
  iat: number;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  stripeAccountId: string | null;
  stripeAccountLinked: boolean;
  onboardingCompleted: boolean;
  metadata: UserMetadata;
  id: string;
  sub: string;
  exp: number;
  iss: string;
  aud: string;
};
export type ApiResponse<T = any> = {
  data: T | null;
  error: string | null;
  status: number;
};
export type TokenProvider = () => Promise<string | null>;
export class GoApiClient {
  private token: string | null = null;
  private tokenExp: number | null = null;

  constructor(
    private tokenProvider: TokenProvider,
    private baseUrl: string,
  ) {}

  private setToken(token: string) {
    try {
      const payload: jwkPayloadType = JSON.parse(atob(token.split(".")[1]));
      this.token = token;
      this.tokenExp = payload.exp;
    } catch (e) {
      console.error("Failed to parse token:", e);
      this.token = null;
      this.tokenExp = null;
    }
  }

  private isTokenValid(): boolean {
    if (!this.token || !this.tokenExp) return false;

    const now = Math.floor(Date.now() / 1000);
    return this.tokenExp > now + MIN_TTL_SECONDS;
  }

  private async getToken(): Promise<string | null> {
    if (this.isTokenValid() && this.token) {
      return this.token;
    }

    const newToken = await this.tokenProvider();

    if (newToken) {
      this.setToken(newToken);
      return newToken;
    }

    this.token = null;
    this.tokenExp = null;
    return null;
  }

  async request<T>(
    endpoint: string,
    init: RequestInit = {},
    responseType: "json" | "text" | "blob" = "json",
  ): Promise<ApiResponse<T>> {
    const fullURL = this.baseUrl + endpoint;
    try {
      const token = await this.getToken();
      const calledAt = new Date();
      console.info(`${init.method?.toUpperCase()} ${fullURL} ${calledAt}`);
      const response = await fetch(fullURL, {
        ...init,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
      });

      let data: any = null;

      switch (responseType) {
        case "json":
          data = await response.json().catch((e) => {
            console.log(`GoApiClientJSONError: `, e, `Data: ${data}`);
            return null;
          });
          break;
        case "text":
          data = await response.text().catch((e) => {
            console.log(`GoApiClientTextError: `, e, `Data: ${data}`);
            return null;
          });
          break;
        case "blob":
          data = await response.blob().catch((e) => {
            console.log(`GoApiClientBlobError: `, e, `Data: ${data}`);
            return null;
          });
          break;
        default:
          data = await response.json().catch((e) => {
            console.log(`GoApiClientJSONError: `, e, `Data: ${data}`);
            return null;
          });
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.token = null;
          this.tokenExp = null;
        }

        const serverMsg = typeof data === "object" ? data?.message : data;

        return {
          data: null,
          error: serverMsg || `API Error: ${response.status}`,
          status: response.status,
        };
      }

      return { data: data as T, error: null, status: response.status };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  }
}
