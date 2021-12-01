interface StravaProps {
  distance: number;
  count: number;
}

const metresToMiles = (metres: number) => Math.round(0.000621 * metres);

export const Strava = ({ distance, count }: StravaProps): JSX.Element => (
  <div>
    <h3>Strava Running Data</h3>
    <ul>
      <li>Distance: {metresToMiles(distance)}m</li>
      <li>Number of Runs: {count}</li>
    </ul>
  </div>
);
