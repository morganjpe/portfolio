import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json } from "remix";

import { getStravaAthleteData } from "../utils/strava";
import type { AthleteDataResponse } from "../utils/strava";

export let loader: LoaderFunction = async ({ request }) => {
  const response = await getStravaAthleteData(request);

  if (!response) {
    return json({ error: "could not get athlete data" });
  }

  return response;
};

export let meta: MetaFunction = () => ({
  title: "Morgan Evans - Front End Engineer",
  description: "Hey! I'm a Front End Developer based in the UK.",
});

const metresToMiles = (metres: number) => Math.round(0.000621 * metres);

export default function Index() {
  let { error, data } = useLoaderData<AthleteDataResponse>();

  if (error || !data) {
    return <div>there has been an error: {error}</div>;
  }

  const { distance, count } = data;

  return (
    <div className="remix__page">
      <ul>
        <li>Distance {metresToMiles(distance)}m</li>
        <li>Count {count}</li>
      </ul>
    </div>
  );
}
