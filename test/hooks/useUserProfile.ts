import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useApi } from "./useApi";

type UserProfile = {
  bio: string;
  avatarUrl: string;
};

export function useUserProfile() {
  const { user } = useAuth();
  const { data: profile, loading } = useApi<UserProfile>(
    `/api/users/${user?.id}/profile`,
  );

  const displayName = useMemo(() => {
    if (!user) return "Guest";
    return user.name;
  }, [user]);

  return { profile, displayName, loading };
}
