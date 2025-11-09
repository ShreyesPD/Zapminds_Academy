import { useServerSupabase } from "~/server/utils/supabase-client";
import { getCurrentSeason } from "~/server/utils/leaderboard-updater";
import { getTierByName } from "~/utils/xp-tiers";

const extractBearerToken = (authorizationHeader: string | undefined | null) => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }

  return null;
};

export default defineEventHandler(async (event) => {
  const supabase = useServerSupabase();
  const params = event.context.params ?? {};
  const seasonParam = params.seasonId ?? "current";
  const token = extractBearerToken(getHeader(event, "authorization"));

  let requesterId: string | null = null;
  if (token) {
    const { data: authUser } = await supabase.auth.getUser(token);
    requesterId = authUser?.user?.id ?? null;
  }

  let seasonId: number | null = Number.isNaN(Number(seasonParam)) ? null : Number(seasonParam);

  if (seasonParam === "current" || seasonId === null) {
    const activeSeason = await getCurrentSeason();
    if (!activeSeason) {
      return {
        season: null,
        entries: [],
        userEntry: null,
      };
    }
    seasonId = activeSeason.id;
  }

  const { data: season, error: seasonError } = await supabase
    .from("leaderboard_seasons")
    .select("id, name, starts_at, ends_at")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonError || !season) {
    throw createError({ statusCode: 404, statusMessage: "Leaderboard season not found" });
  }

  const { data: entries, error: entriesError } = await supabase
    .from("season_leaderboard_entries")
    .select("user_id, rank, xp_total, tier")
    .eq("season_id", season.id)
    .order("rank", { ascending: true });

  if (entriesError) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load leaderboard entries: ${entriesError.message}`,
    });
  }

  const userIds = entries?.map((entry) => entry.user_id) ?? [];
  const profileMap = new Map<string, { display_name: string | null; avatar_url: string | null }>();

  if (userIds.length) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    if (profilesError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to load leaderboard profiles: ${profilesError.message}`,
      });
    }

    for (const profile of profiles ?? []) {
      profileMap.set(profile.user_id, {
        display_name: profile.display_name ?? null,
        avatar_url: profile.avatar_url ?? null,
      });
    }
  }

  const normalizedEntries = (entries ?? []).map((entry) => {
    const tier = getTierByName(entry.tier ?? "Bronze");
    return {
      user_id: entry.user_id,
      rank: entry.rank,
      xp_total: entry.xp_total,
      tier: entry.tier ?? "Bronze",
      tier_icon: tier?.icon ?? "🥉",
      display_name: profileMap.get(entry.user_id)?.display_name ?? "Unknown Student",
      avatar_url: profileMap.get(entry.user_id)?.avatar_url ?? null,
      is_current_user: requesterId === entry.user_id,
    };
  });

  const userEntry = requesterId
    ? normalizedEntries.find((entry) => entry.user_id === requesterId) ?? null
    : null;

  return {
    season,
    entries: normalizedEntries,
    userEntry,
  };
});
