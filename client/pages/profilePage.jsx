import { useLoader } from "../utils/hooks";
import { fetchJSON } from "../utils/json";

export const Profile = () => {
  const { loading, data, error } = useLoader(async () => {
    try {
      return await fetchJSON("/api/login");
    } catch (err) {
      throw new Error(`Failed to load profile: ${err.message}`);
    }
  });

  if (loading) return <div>Please wait...</div>;
  if (error) return <div>Error! {error.toString()}</div>;

  if (!data || !data.name || !data.email) {
    return <div>Error: Invalid user data</div>;
  }

  return (
    <div>
      <h1>
        Profile for {data.name} ({data.email})
      </h1>
      <div>
        <img src={data.picture} alt="Profile picture" />
      </div>
    </div>
  );
};
