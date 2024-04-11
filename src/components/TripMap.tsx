import "./TripMap.css";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
interface ContainerProps {}

const TripMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-98.5795); // Example longitude
  const [lat, setLat] = useState(39.8283); // Example latitude
  const [zoom, setZoom] = useState(3); // Initial zoom level
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<Array<[number, number]>>([]);
  console.log(import.meta.env.VITE_MAPBOX_KEY);

  // Initialize map when the component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // Add navigation controls to the map.
    map.current.addControl(new mapboxgl.NavigationControl());
  });

  // Watch position
  useEffect(() => {
    let watchId = null;

    const onSuccess = (position: {
      coords: { latitude: any; longitude: any };
    }) => {
      const { latitude, longitude } = position.coords;
      setLng(longitude);
      setLat(latitude);
      setRoute((currentRoute) => [...currentRoute, [longitude, latitude]]);

      if (map.current) {
        map.current.flyTo({
          center: [longitude, latitude],
          essential: true,
          zoom: 15,
        });
      }
    };

    const onError = (error: { message: any }) => {
      console.log(`Error getting location: ${error.message}`);
    };

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
      });
    } else if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);

  // Draw route
  useEffect(() => {
    if (!map.current) return; // Early return if map is not initialized

    const currentMap = map.current; // Assign map.current to a local variable

    if (route.length > 1) {
      currentMap.on("load", () => {
        const routeSource = currentMap.getSource(
          "route"
        ) as mapboxgl.GeoJSONSource;

        if (routeSource) {
          routeSource.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route,
            },
          });
        } else {
          currentMap.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route,
              },
            },
          });

          currentMap.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#888",
              "line-width": 8,
            },
          });
        }
      });
    }
  }, [route]); // Assuming 'route' is a dependency of this effect

  // Button to toggle tracking
  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div>
      <button onClick={toggleTracking}>
        {isTracking ? "Stop Tracking" : "Start Tracking"}
      </button>
      <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />
    </div>
  );
};

export default TripMap;
