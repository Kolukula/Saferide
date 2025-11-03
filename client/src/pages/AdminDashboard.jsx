import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import io from "socket.io-client";

const socket = io("https://saferide-eo3u.onrender.com");

const AdminDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [newBus, setNewBus] = useState({ busNumber: "", route: "", capacity: "" });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalBuses: 0, activeBuses: 0 });

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
    });

    socket.on("busAdded", (addedBus) => {
      setBuses((prev) => [...prev, addedBus]);
      setStats(prev => ({ ...prev, totalBuses: prev.totalBuses + 1 }));
    });

    return () => {
      socket.off("locationUpdate");
      socket.off("busAdded");
    };
  }, []);

  useEffect(() => {
    setStats({
      totalBuses: buses.length,
      activeBuses: buses.filter(bus => bus.currentLocation).length
    });
  }, [buses]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/buses/getbuses");
      setBuses(data);
    } catch (err) {
      console.error("Fetch Buses Error:", err.response?.data || err.message);
      alert("Failed to fetch buses");
    } finally {
      setLoading(false);
    }
  };

  const addBus = async () => {
    try {
      if (!newBus.busNumber || !newBus.route || !newBus.capacity) {
        return alert("All fields are required!");
      }

      setLoading(true);
      const { data } = await axiosInstance.post("/buses/addbus", {
        ...newBus,
        capacity: parseInt(newBus.capacity)
      });

      alert(`Bus ${data.busNumber} added successfully!`);
      setNewBus({ busNumber: "", route: "", capacity: "" });
    } catch (err) {
      console.error("Add Bus Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to add bus");
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;

    try {
      await axiosInstance.delete(`/buses/${id}`);
      alert("Bus deleted successfully!");
      setBuses((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete Bus Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete bus");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-600">Manage buses and monitor locations</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center min-w-32">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBuses}</div>
            <div className="text-sm text-gray-600">Total Buses</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center min-w-32">
            <div className="text-2xl font-bold text-green-600">{stats.activeBuses}</div>
            <div className="text-sm text-gray-600">Active Buses</div>
          </div>
        </div>
      </div>

      {/* Add Bus Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Bus</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Bus Number"
            value={newBus.busNumber}
            onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Route"
            value={newBus.route}
            onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <input
            type="number"
            placeholder="Capacity"
            value={newBus.capacity}
            onChange={(e) => setNewBus({ ...newBus, capacity: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button 
            onClick={addBus} 
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Bus"}
          </button>
        </div>
      </div>

      {/* Buses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Bus Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buses.map((bus) => (
                <tr key={bus._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600">🚌</span>
                      </div>
                      <span className="font-semibold text-gray-900">{bus.busNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{bus.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {bus.capacity} seats
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bus.currentLocation 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {bus.currentLocation ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteBus(bus._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:ring-4 focus:ring-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Live Bus Locations</h3>
        </div>
        <div className="h-96 w-full">
          <MapContainer
            center={[buses[0]?.currentLocation?.lat || 0, buses[0]?.currentLocation?.lng || 0]}
            zoom={12}
            className="h-full w-full rounded-b-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {buses.map(
              (bus) =>
                bus.currentLocation?.lat &&
                bus.currentLocation?.lng && (
                  <Marker
                    key={bus._id}
                    position={[bus.currentLocation.lat, bus.currentLocation.lng]}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-bold text-lg">{bus.busNumber}</div>
                        <div className="text-gray-600">{bus.route}</div>
                        <div className="text-sm mt-1">
                          Driver: {bus.driver?.name || "Not assigned"}
                        </div>
                        <div className="text-sm">
                          Capacity: {bus.capacity} seats
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;