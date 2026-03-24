import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generic hook to fetch model average scores from an external leaderboard Space API.
 * Returns a map of { modelName: averageScore } for use in the main leaderboard.
 *
 * @param {string} url - Full URL to the /api/leaderboard/formatted endpoint
 * @param {string} cacheKey - Unique localStorage cache key
 */
export const useExternalLeaderboardData = (url, cacheKey) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [cacheKey],
    queryFn: async () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            return cachedData;
          }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const newData = await response.json();
        localStorage.setItem(cacheKey, JSON.stringify({ data: newData, timestamp: Date.now() }));
        return newData;
      } catch (err) {
        console.error(`External leaderboard fetch error (${cacheKey}):`, err);
        return [];
      }
    },
    staleTime: CACHE_DURATION,
    cacheTime: CACHE_DURATION * 2,
    refetchOnWindowFocus: false,
  });

  // Build modelName → averageScore map; treat 0 as null (no data yet)
  const scoreMap = useMemo(() => {
    if (!data || !Array.isArray(data)) return {};
    return data.reduce((acc, item) => {
      const name = item?.model?.name;
      const score = item?.model?.average_score;
      if (name && score != null && score > 0) {
        acc[name] = score;
      }
      return acc;
    }, {});
  }, [data]);

  return { scoreMap, isLoading, error };
};
