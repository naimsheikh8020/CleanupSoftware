import { useEffect } from "react";
import { useMap } from "../ui/map";

type Location = { lat: number; lng: number };

export function MapClickHandler({
  onSelect,
  onPress
}: {
  onSelect: (location: Location) => void;
  onPress?: (location: Location) => void;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      // console.log("Map clicked at:", lat, lng);
      onSelect({ lng, lat });
      onPress?.({ lng, lat });
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, isLoaded, onSelect]);

  return null;
}
