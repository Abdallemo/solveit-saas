import { unstable_cache as cache, revalidateTag } from "next/cache";

type AvailableTags =
  | "user-data-cache"
  | "dispute-data-cache"
  | "category-data-cache"|"deadline-data-cache";

type CacheOptions<T, P> = {
  tag: AvailableTags;
  dep?: string[];
  callback: (param?: P) => Promise<T>;
  revalidateMs?: number;
  enabled?: boolean;
};

export function withCache<T, P>({
  callback,
  dep = [],
  revalidateMs = 60,
  tag,
  enabled = true,
}: CacheOptions<T, P>) {
  if (!enabled) {
    return (param?: P) => callback(param);
  }

  return (param?: P) =>
    cache(
      async () => await callback(param),
      dep.length > 0 ? dep : [tag],
      { tags: [param ? `${tag}-${param}` : tag], revalidate: revalidateMs }
    )();
}

export function withRevalidateTag(tag: AvailableTags, params?: string) {
  revalidateTag(params ? `${tag}-${params}` : tag);
}
