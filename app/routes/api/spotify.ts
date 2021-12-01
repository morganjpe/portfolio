import { LoaderFunction } from "remix";

export const loader: LoaderFunction = ({ request }) => {
  console.log(request.headers.get("spotify_access_token"));

  return new Response(JSON.stringify({ hello: "world" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
