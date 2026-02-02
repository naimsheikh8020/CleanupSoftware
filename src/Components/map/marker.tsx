import { useEffect, useId, useState } from "react";
import { MapPopup, useMap } from "../ui/map";

interface SelectedPoint {
  id: number;
  name: string;
  category: string;
  coordinates: [number, number];
  region?: string;
}

export default function MarkersLayer({ pointsData }: { pointsData: GeoJSON.FeatureCollection }) {
  const { map, isLoaded } = useMap();
  const id = useId()

  const sourceId = `markers-source-${id}`;
  const layerId = `markers-layer-${id}`;
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    null,
  );

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(sourceId, {
      type: "geojson",
      data: pointsData,
    });

    map.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: {
         "circle-radius": 6,

         "circle-color": [
            "match",
            ["get", "category"],
            "residential", "#3b82f6",
            "commercial",  "#22c55e",
            "industrial",  "#f97316",
            "office",      "#a855f7",
            "#9ca3af",
         ],

         "circle-stroke-width": 2,
         "circle-stroke-color": "#ffffff",
      },
    });

    const handleClick = (
      e: maplibregl.MapMouseEvent & {
        features?: maplibregl.MapGeoJSONFeature[];
      },
    ) => {
      if (!e.features?.length) return;
      console.log("Clicked at:", e);

      const feature = e.features[0];
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number,
      ];

      setSelectedPoint({
        id: feature.properties?.id,
        name: feature.properties?.name,
        category: feature.properties?.category,
        coordinates: coords,
        region: feature.properties?.region,
      });
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);

      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [map, isLoaded, sourceId, layerId]);

  return (
    <>
      {selectedPoint && (
        <MapPopup
          longitude={selectedPoint.coordinates[0]}
          latitude={selectedPoint.coordinates[1]}
          onClose={() => setSelectedPoint(null)}
          closeOnClick={false}
          focusAfterOpen={false}
          offset={10}
          closeButton
        >
          <div className="min-w-[140px]">
            <p className="font-medium">{selectedPoint.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedPoint.category}
            </p>
            <p className="text-sm text-muted-foreground">Region: {selectedPoint.region}</p>
          </div>
        </MapPopup>
      )}
    </>
  );
}
