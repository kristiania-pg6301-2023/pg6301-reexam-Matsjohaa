import { useLoader } from "../utils/hooks";
import { fetchJSON } from "../utils/json";

export const Profile = () => {
  const { loading, data, error } = useLoader(async () => {
    return await fetchJSON("api/login");
  });

  if (loading) {
    return <div>Please wait...</div>;
  }
  if (error) {
    return <div>Error! {error.toString()}</div>;
  }
  return (
    <div>
      <h1>
        Profile for {data.name} ({data.email})
      </h1>
      <div>
        <img src={data.picture} alt={"profile picture"} />
      </div>
    </div>
  );
};
