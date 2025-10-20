import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const DriverDashboard = () => {
  const [bus, setBus] = useState(null);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    fetchBus();
  }, []);

  useEffect(() => {
    if (!bus || !isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newSpeed = position.coords.speed || 0;
        
        setCoords({ lat: latitude, lng: longitude });
        setSpeed(newSpeed);

        try {
          await axiosInstance.put(`/buses/${bus._id}/location`, {
            lat: latitude,
            lng: longitude,
          });
          
          socket.emit("busLocationUpdate", {
            busId: bus._id,
            lat: latitude,
            lng: longitude,
          });
        } catch (err) {
          console.error("Failed to update location:", err);
        }
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [bus, isTracking]);

  const fetchBus = async () => {
    try {
      const { data } = await axiosInstance.get("/buses/getbuses");
      if (data.length > 0) {
        const assignedBus = data[0]; // In real app, filter by driver
        setBus(assignedBus);
        if (assignedBus.currentLocation) {
          setCoords(assignedBus.currentLocation);
        }
      }
    } catch (err) {
      console.error("Failed to fetch bus:", err);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Driver Dashboard</h2>
          <p className="text-gray-600">Manage your bus and location tracking</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center min-w-32">
            <div className="text-2xl font-bold text-blue-600">
              {speed ? `${Math.round(speed * 3.6)} km/h` : "0 km/h"}
            </div>
            <div className="text-sm text-gray-600">Current Speed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center min-w-32">
            <div className="text-2xl font-bold text-green-600">
              {isTracking ? "Active" : "Paused"}
            </div>
            <div className="text-sm text-gray-600">Tracking Status</div>
          </div>
        </div>
      </div>

      {/* Bus Info Card */}
      {bus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bus Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bus Number:</span>
                <span className="font-semibold">{bus.busNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Route:</span>
                <span className="font-semibold">{bus.route}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-semibold">{bus.capacity} seats</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Tracking</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isTracking ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {isTracking ? "Tracking Active" : "Tracking Paused"}
                </span>
              </div>
              <button
                onClick={toggleTracking}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 focus:ring-4 ${
                  isTracking
                    ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-200 text-white"
                    : "bg-green-500 hover:bg-green-600 focus:ring-green-200 text-white"
                }`}
              >
                {isTracking ? "Pause Tracking" : "Start Tracking"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Location</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono">{coords.lat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono">{coords.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Live Location Map</h3>
        </div>
        <div className="h-96 w-full">
          <MapContainer 
            center={[coords.lat, coords.lng]} 
            zoom={15} 
            className="h-full w-full rounded-b-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>
                <div className="p-2">
                  <div className="font-bold text-lg">{bus?.busNumber}</div>
                  <div className="text-gray-600">{bus?.route}</div>
                  <div className="text-sm mt-1">
                    Speed: {speed ? `${Math.round(speed * 3.6)} km/h` : "0 km/h"}
                  </div>
                  <div className="text-sm">
                    Status: {isTracking ? "Tracking Active" : "Tracking Paused"}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;