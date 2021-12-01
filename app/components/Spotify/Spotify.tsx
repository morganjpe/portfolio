import { useFetcher } from "remix";
import { useEffect, useState } from "react";

interface SpotifyProps {
  duration: number;
  progress: number;
  name: string;
  url: string;
  error?: string;
}

export const Spotify = ({
  //   duration,
  //   progress,
  name,
  url,
  error,
}: SpotifyProps): JSX.Element => {
  if (error) {
    return <div>Not Playing</div>;
  }

  return (
    <div>
      <p>currently playing: </p>
      <ul>
        <li>
          <a href={url}>{name}</a>
        </li>
      </ul>
    </div>
  );
};
