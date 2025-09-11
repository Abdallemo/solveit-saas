import { unstable_cache as cache } from "next/cache";
import { getUserById } from "./actions";

export function getUserByIdCached  (id: string)  {
  return cache(
    async () => {
      return await getUserById(id);
    },
    [`user-data-cache-${id}`],
    {
      tags: [`user-${id}`],
    }
  )();
};
