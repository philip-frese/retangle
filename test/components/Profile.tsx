import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";

export function Profile() {
  const { user, logout } = useAuth();
  const { profile, loading } = useUserProfile();

  if (!user) return <div>Not logged in</div>;
  if (loading) return <div>Loading profile...</div>;

  return (
    <div>
      <img src={profile?.avatarUrl} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
