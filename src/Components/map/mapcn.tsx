import { Map, MapControls } from "../ui/map";
import { useGetBuildingCoordinatesQuery } from "@/redux/features/admin/buildings/building.api";
import MarkersLayer from "./marker";

export function LayerMarkers() {
  const riyadh = { lat: 24.7136, lng: 46.6753 };
  const { data, isSuccess } = useGetBuildingCoordinatesQuery(undefined);

  const featureCollection: GeoJSON.FeatureCollection | null = isSuccess
    ? {
        type: "FeatureCollection",
        features: data.map((item) => ({
          type: "Feature",
          geometry: item.geometry,
          properties: item.properties,
        })),
      }
    : null;

  return (
    <div className="h-full w-full">
      <Map
        center={riyadh}
        zoom={11}
        style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <MapControls showZoom showCompass showLocate showFullscreen />
        {featureCollection && <MarkersLayer pointsData={featureCollection} />}
      </Map>
    </div>
  );
}
