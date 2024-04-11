import "./TripMap.css";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
interface ContainerProps {}

const TripMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-98.5795); // Example longitude
  const [lat, setLat] = useState(39.8283); // Example latitude
  const [zoom, setZoom] = useState(3); // Initial zoom level
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState([]);
  console.log(import.meta.env.VITE_MAPBOX_KEY);

  // Initialize map when the component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
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

    const onSuccess = (position) => {
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

    const onError = (error) => {
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
    if (!map.current) return;
    if (route.length > 1) {
      map.current.on("load", () => {
        if (map.current.getSource("route")) {
          map.current.getSource("route").setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route,
            },
          });
        } else {
          map.current.addSource("route", {
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

          map.current.addLayer({
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
  }, [route]);

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
