import "./TripMap.css";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getSingleTripInfo, createTripInfo } from "../Appwrite/Api/tripInfoApi";
interface ContainerProps {}

const TripMap = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-98.5795); // Example longitude
  const [lat, setLat] = useState(39.8283); // Example latitude
  const [zoom, setZoom] = useState(3); // Initial zoom level
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<any>([]);
  const [stops, setStops] = useState<any>([]);
  const [trips, setTrips] = useState<any>([]);
  const [tripName, setTripName] = useState<string>("");
  const [stop, setStop] = useState<number>(0);

  const getTripTest = async () => {
    try {
      const data = await getSingleTripInfo("66185f47afba58aef20f");
      console.log("the data", data);
    } catch (err: any) {
      console.log(err);
    }
  };
  const createTripTest = async () => {
    console.log("trips in create", trips);
    try {
      const data = await createTripInfo(trips);
      console.log("the data", data);
    } catch (err: any) {
      console.log(err);
    }
  };

  const markStop = () => {
    if (!isTracking || lat === 0 || lng === 0) return; // Add validation as needed
    const routeData = [lat + 1];
    const newStop = {
      tripName,

      lat,
      lng,
    };

    setStops((prevStops: any) => [...prevStops, [lng + 1, lat + 1]]);
  };

  const saveTrip = async () => {
    const routeData = JSON.stringify(stops);

    console.log("the route data", routeData);

    const newTrip = {
      route: routeData,
      tripName,
    };

    await setTrips(newTrip);
    // setTrips((prevTrips: any) => [...prevTrips, newTrip]);
    await createTripInfo(trips);
    setIsTracking(false); // Stop tracking
    setRoute([]); // Reset the route
    setStops([]); // Reset the stops
  };

  const addStoryToStop = (storyText: any) => {
    if (stops.length === 0) return;

    const updatedStops = stops.map((stop: any, index: number) => {
      if (index === 0) {
        // This is just an example, adjust as needed
        return { ...stop, story: storyText };
      }
      return stop;
    });

    setStops(updatedStops);
  };

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

  // Watch positions
  useEffect(() => {
    let watchId = null;

    const onSuccess = (position: {
      coords: { latitude: any; longitude: any };
    }) => {
      const { latitude, longitude } = position.coords;
      setLng(longitude);
      setLat(latitude);
      setRoute((currentRoute: any) => [
        ...currentRoute,
        [longitude + 1, latitude + 1],
      ]);

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

  console.log("trips", trips);
  console.log("stops", stops);
  console.log("tripname", tripName);
  console.log("route", route);

  return (
    <div>
      <div>TripName</div>
      <input value={tripName} onChange={(e) => setTripName(e.target.value)} />
      <div></div>
      <button onClick={toggleTracking}>
        {isTracking ? "Stop Tracking" : "Start Tracking"}
      </button>
      <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />
      {isTracking && <button onClick={markStop}>Mark Stop</button>}
      <div></div>
      <button onClick={saveTrip}>Save Trip</button>
      <div></div>
      <button onClick={() => getTripTest()}>getInfo</button>
    </div>
  );
};

export default TripMap;
