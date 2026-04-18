import { useUserProfile } from "../hooks/useUserProfile";
import { useTheme } from "../hooks/useTheme";

export function Dashboard() {
  const { profile, displayName, loading } = useUserProfile();
  const { theme, toggle } = useTheme();

  if (loading) return <div>Loading...</div>;

  return (
    <div data-theme={theme}>
      <h1>Welcome, {displayName}</h1>
      {profile && <p>{profile.bio}</p>}
      <button onClick={toggle}>Toggle theme</button>
    </div>
  );
}
