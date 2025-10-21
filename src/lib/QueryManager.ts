export type Parser<T> = {
  parse: (val: string | null, defVal: T) => T;
  serialize: (val: T) => string;
};

type Subscriber = () => void;

class QueryParamManager {
  private static instance: QueryParamManager | null = null;
  private params: URLSearchParams;
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private globalSubscribers: Set<Subscriber> = new Set();
  private listening = false;

  private constructor() {
    this.params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    if (typeof window !== "undefined") this.startListening();
  }

  public static getInstance() {
    if (!QueryParamManager.instance) {
      QueryParamManager.instance = new QueryParamManager();
    }
    return QueryParamManager.instance;
  }

  private startListening() {
    if (this.listening) return;
    this.listening = true;
    window.addEventListener("popstate", this.handlePopState);
  }

  private stopListening() {
    if (!this.listening) return;
    this.listening = false;
    window.removeEventListener("popstate", this.handlePopState);
  }

  private handlePopState = () => {
    const newParams = new URLSearchParams(window.location.search);
    this.params = newParams;

    for (const [, set] of this.subscribers) {
      for (const cb of set) cb();
    }
    for (const cb of this.globalSubscribers) cb();
  };

  private replaceUrl() {
    const q = this.params.toString();
    const newUrl = q
      ? `${window.location.pathname}?${q}${window.location.hash ?? ""}`
      : `${window.location.pathname}${window.location.hash ?? ""}`;
    window.history.replaceState(null, "", newUrl);
  }
  public get<T>(key: string, def: T): T {
    const raw = this.params.get(key);
    return this.inferParse(raw, def);
  }

  public set<T>(key: string, value: T) {
    const serialized = this.inferSerialize(value);
    this.params.set(key, serialized);
    this.replaceUrl();
    this.notifyKey(key);
  }

  private inferSerialize<T>(val: T): string {
    if (typeof val === "boolean") return val ? "true" : "false";
    return String(val);
  }

  private inferParse<T>(val: string | null, defVal: T): T {
    if (val == null) return defVal;
    if (typeof defVal === "number") return Number(val) as unknown as T;
    if (typeof defVal === "boolean") return (val === "true") as unknown as T;
    return val as unknown as T;
  }
  public delete(key: string) {
    this.params.delete(key);
    this.replaceUrl();
    this.notifyKey(key);
  }

  private notifyKey(key: string) {
    const set = this.subscribers.get(key);
    if (set) for (const cb of set) cb();
    for (const cb of this.globalSubscribers) cb();
  }

  public subscribe(key: string, cb: Subscriber) {
    let set = this.subscribers.get(key);
    if (!set) {
      set = new Set();
      this.subscribers.set(key, set);
    }
    set.add(cb);

    return () => {
      set!.delete(cb);
      if (set!.size === 0) this.subscribers.delete(key);

      if (this.subscribers.size === 0 && this.globalSubscribers.size === 0) {
        this.stopListening();
      }
    };
  }

  public subscribeAll(cb: Subscriber) {
    this.globalSubscribers.add(cb);
    return () => {
      this.globalSubscribers.delete(cb);
      if (this.subscribers.size === 0 && this.globalSubscribers.size === 0) {
        this.stopListening();
      }
    };
  }
}

export default QueryParamManager;
