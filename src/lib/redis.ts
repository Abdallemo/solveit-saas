import { env } from "@/env/server";
import { createClient, SetOptions } from "redis";
/**Defualt to 1Day */
export const TTL = 86400;
export type TurnServerType = {
  createdAt: Date;
  ttl: number;
  turn: RTCIceServer[];
};
export type redisCacheKeys = "TURN_CACHE";
const redis = await createClient({ url: env.REDIS_URL })
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export default redis;
export async function SetCachedValue(
  key: redisCacheKeys,
  data: TurnServerType,
  options: SetOptions = { expiration: { type: "EX", value: TTL - 60 } }
) {
  await redis.set(key, JSON.stringify(data), options);
}
export async function GetCachedValue(
  key: redisCacheKeys
): Promise<TurnServerType | null> {
  let cachedData: TurnServerType;
  const redisRes = await redis.get(key);
  if (redisRes) {
    return (cachedData = JSON.parse(redisRes));
  }
  return null;
}
