import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface DbProfile {
  id: string;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
}

export interface DbScore {
  user_id: string;
  total_score: number;
  level: number;
  organisms_played: number;
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DbProfile | null>(null);

  const refreshProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji, avatar_url")
      .eq("id", uid)
      .maybeSingle();
    setProfile((data as DbProfile | null) ?? null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // defer to avoid deadlock
        setTimeout(() => refreshProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) refreshProfile(session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, profile, loading, signOut, refreshProfile };
}

export async function upsertMyScore(input: {
  userId: string;
  total_score: number;
  level: number;
  organisms_played: number;
}) {
  await supabase.from("scores").upsert({
    user_id: input.userId,
    total_score: input.total_score,
    level: input.level,
    organisms_played: input.organisms_played,
  });
}