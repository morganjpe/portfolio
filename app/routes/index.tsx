import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData } from "remix";

// strava
import { getStravaAthleteData } from "~/utils/strava";
import type { AthleteDataResponse } from "~/utils/strava";

// spotify
import { getSpotifyData } from "~/utils/spotify";
import type { SpotifyDataResponse } from "~/utils/spotify";

// components
import { Spotify } from "../components/Spotify";
import { Strava } from "../components/Strava";

export let loader: LoaderFunction = async ({ request }) => {
  const data = [
    {
      type: "spotify",
      data: await getSpotifyData(request),
    },
    {
      type: "strava",
      data: await getStravaAthleteData(request),
    },
  ];

  const initial: { cookies: string[]; body: any } = { cookies: [], body: {} };

  const sortedData = data.reduce((prev, current) => {
    const { data, type } = current;
    const { cookies, body } = prev;
    const cookieCopy = [...cookies];

    if (data?.cookie) {
      cookieCopy.push(data.cookie);
    }

    return {
      cookies: cookieCopy,
      body: {
        ...body,
        [type]: data?.body
          ? { data: data.body }
          : { error: `no response for ${type}` },
      },
    };
  }, initial);

  return new Response(JSON.stringify(sortedData.body), {
    headers: {
      "Set-Cookie": sortedData.cookies.join(", "),
      "Content-Type": "application/json",
    },
  });
};

export let meta: MetaFunction = () => ({
  title: "Morgan Evans - Front End Engineer",
  description: "Hey! I'm a Front End Developer based in the UK.",
});

export default function Index() {
  let response = useLoaderData<{
    strava: AthleteDataResponse;
    spotify: SpotifyDataResponse;
  }>();

  const {
    strava: { data: stravaData },
    spotify: { data: spotifyData },
  } = response || {};

  return (
    <div className="remix__page">
      {spotifyData && (
        <Spotify
          duration={spotifyData.item.duration_ms}
          url={spotifyData.item.href}
          name={spotifyData.item.name}
          progress={spotifyData.progress_ms}
        />
      )}
      {stravaData && (
        <Strava distance={stravaData.distance} count={stravaData.count} />
      )}
    </div>
  );
}
