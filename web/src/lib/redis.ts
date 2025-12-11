import { env } from "@/env/server";
import { createClient, SetOptions } from "redis";

let redisInstance: ReturnType<typeof createClient> | null = null;

/**Defualt to 1Day */
export const TTL = 86400;
export type TurnServerType = {
  createdAt: Date;
  ttl: number;
  turn: RTCIceServer[];
};
export type redisCacheKeys = "TURN_CACHE";

export async function getRedis() {
  if (!redisInstance) {
    redisInstance = createClient({ url: env.REDIS_URL });
    redisInstance.on("error", (err) => console.log("Redis Client Error", err));
    await redisInstance.connect();
  }
  return redisInstance;
}
export default redisInstance;
export async function SetCachedValue(
  key: redisCacheKeys,
  data: TurnServerType,
  options: SetOptions = { expiration: { type: "EX", value: TTL - 60 } }
) {
  const redis = await getRedis();
  await redis.set(key, JSON.stringify(data), options);
}

export async function GetCachedValue(
  key: redisCacheKeys
): Promise<TurnServerType | null> {
  let cachedData: TurnServerType;
  const redis = await getRedis();

  const redisRes = await redis.get(key);
  if (redisRes) {
    return (cachedData = JSON.parse(redisRes));
  }
  return null;
}
export async function DeleteCachedValue(key: redisCacheKeys): Promise<boolean> {
  const redis = await getRedis();

  const res = await redis.del(key);
  return res > 0;
}

export type RedisKnowPatters = "openai:moderation:*" | "openai:autosuggestion:*" | (string & {})
export async function DeleteKeysByPattern(pattern: RedisKnowPatters): Promise<number> {
  const redis = await getRedis();

  let totalDeleted = 0;

  for await (const key of redis.scanIterator({
    MATCH: pattern,
    COUNT: 1000,
  })) {
    await redis.del(key);
    totalDeleted++;
  }

  return totalDeleted;
}



export async function GetKeysByPattern(pattern: RedisKnowPatters): Promise<string[]> {
  const redis = await getRedis();

  const keys: string[] = [];

  for await (const key of redis.scanIterator({
    MATCH: pattern,
    COUNT: 1000,
  })) {
    keys.push(...key);
  }

  return keys;
}
