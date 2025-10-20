import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const MapUpdater = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const StudentDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    fetchBuses();

    socket.on("locationUpdate", (updatedBus) => {
      setBuses((prev) =>
        prev.map((b) =>
          b._id === updatedBus.busId
            ? { ...b, currentLocation: { lat: updatedBus.lat, lng: updatedBus.lng } }
            : b
        )
      );

      if (selectedBus && updatedBus.busId === selectedBus._id) {
        setLiveLocation({ lat: updatedBus.lat, lng: updatedBus.lng });
      }
    });

    return () => socket.off("locationUpdate");
  }, [selectedBus]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/buses/getbuses");
      setBuses(data);
    } catch (err) {
      console.error("Error fetching buses:", err);
      alert("Failed to fetch buses");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    if (bus.currentLocation) {
      setLiveLocation(bus.currentLocation);
    } else {
      alert("This bus does not have a live location yet.");
    }
  };

  const getBusStatus = (bus) => {
    return bus.currentLocation ? "Active" : "Inactive";
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "text-green-600" : "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Track Your Bus</h2>
        <p className="text-gray-600 mt-2">Real-time bus tracking and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bus List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Buses</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
              </div>
            ) : buses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🚌</div>
                <p>No buses available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {buses.map((bus) => (
                  <div
                    key={bus._id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedBus?._id === bus._id
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => handleSelectBus(bus)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg">🚌</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{bus.busNumber}</div>
                          <div className={`text-sm font-medium ${getStatusColor(getBusStatus(bus))}`}>
                            {getBusStatus(bus)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Route: {bus.route}</div>
                      <div>Capacity: {bus.capacity} seats</div>
                      {bus.driver?.name && (
                        <div>Driver: {bus.driver.name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full min-h-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedBus ? `Tracking: ${selectedBus.busNumber}` : "Live Bus Map"}
              </h3>
              {selectedBus && (
                <p className="text-gray-600 text-sm mt-1">
                  Route: {selectedBus.route} • Capacity: {selectedBus.capacity} seats
                </p>
              )}
            </div>
            
            {selectedBus ? (
              <MapContainer
                ref={mapRef}
                center={[
                  liveLocation?.lat || selectedBus.currentLocation?.lat || 0,
                  liveLocation?.lng || selectedBus.currentLocation?.lng || 0,
                ]}
                zoom={14}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {liveLocation?.lat && liveLocation?.lng && (
                  <>
                    <Marker position={[liveLocation.lat, liveLocation.lng]}>
                      <Popup>
                        <div className="p-2">
                          <div className="font-bold text-lg">{selectedBus.busNumber}</div>
                          <div className="text-gray-600">{selectedBus.route}</div>
                          <div className="text-sm mt-1">
                            Driver: {selectedBus.driver?.name || "Not assigned"}
                          </div>
                          <div className="text-sm">
                            Capacity: {selectedBus.capacity} seats
                          </div>
                          <div className="text-sm text-green-600 font-semibold mt-1">
                            ● Live Tracking Active
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                    <MapUpdater lat={liveLocation.lat} lng={liveLocation.lng} />
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">Select a Bus to Track</h3>
                <p className="text-center max-w-md">
                  Choose a bus from the list to view its real-time location and route information on the map.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;