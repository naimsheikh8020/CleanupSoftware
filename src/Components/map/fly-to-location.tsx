import { useEffect } from "react";
import { useMap } from "../ui/map";

export default function FlyToLocation({ location }: { location?: { lat: number; lng: number } }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !location) return;

    map.flyTo({
      center: [location.lng, location.lat],
      zoom: 12,
      essential: true,
    });
  }, [map, isLoaded, location]);

  return null;
}
