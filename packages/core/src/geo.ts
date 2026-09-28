import type { Mall } from "./malls";

export type CoordinateBounds = [[number, number], [number, number]];

export function getMallBounds(
  malls: readonly Pick<Mall, "latitude" | "longitude">[],
): CoordinateBounds | null {
  if (malls.length === 0) return null;

  let south = Number.POSITIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;
  let west = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  for (const mall of malls) {
    if (
      !Number.isFinite(mall.latitude) ||
      mall.latitude < -90 ||
      mall.latitude > 90 ||
      !Number.isFinite(mall.longitude) ||
      mall.longitude < -180 ||
      mall.longitude > 180
    ) {
      continue;
    }
    south = Math.min(south, mall.latitude);
    north = Math.max(north, mall.latitude);
    west = Math.min(west, mall.longitude);
    east = Math.max(east, mall.longitude);
  }
  if (south === Number.POSITIVE_INFINITY) return null;

  const latitudePadding = Math.max((north - south) * 0.12, 0.06);
  const longitudePadding = Math.max((east - west) * 0.12, 0.06);

  return [
    [south - latitudePadding, west - longitudePadding],
    [north + latitudePadding, east + longitudePadding],
  ];
}
