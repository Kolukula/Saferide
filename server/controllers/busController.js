// import Bus from "../models/Bus.js";
// import Location from "../models/Location.js";

// // Add a new bus
// export const addbus = async (req, res) => {
//   try {
//     const { busNumber, driver, capacity, route } = req.body;

//     if (!busNumber) {
//       return res.status(400).json({ message: "busNumber is required" });
//     }

//     const exists = await Bus.findOne({ busNumber });
//     if (exists) return res.status(400).json({ message: "Bus already exists" });

//     const bus = await Bus.create({ busNumber, driver, capacity, route });
//     await bus.populate("driver", "name email role");

//     res.status(201).json(bus);
//   } catch (error) {
//     console.error("AddBus error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// // Get all buses
// export const getbuses = async (req, res) => {
//   try {
//     const buses = await Bus.find().populate("driver", "name email role");
//     res.json(buses);
//   } catch (error) {
//     console.error('GetBuses error:', error);
//     res.status(400).json({ message: error.message });
//   }
// };

// // Get bus by ID
// export const getBusById = async (req, res) => {
//   try {
//     const bus = await Bus.findById(req.params.id).populate("driver", "name email role");
//     if (!bus) return res.status(404).json({ message: "Bus not found" });
//     res.json(bus);
//   } catch (error) {
//     console.error("getBusById error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// // Delete bus (Admin only)
// export const deleteBus = async (req, res) => {
//   try {
//     const bus = await Bus.findByIdAndDelete(req.params.id);
//     if (!bus) return res.status(404).json({ message: "Bus not found" });
//     res.json({ message: "Bus deleted successfully" });
//   } catch (error) {
//     console.error("deleteBus error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// // Update bus location & broadcast
// export const updateBusLocation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { lat, lng } = req.body;

//     if (lat === undefined || lng === undefined) {
//       return res.status(400).json({ message: "Latitude and longitude are required" });
//     }

//     const bus = await Bus.findByIdAndUpdate(
//       id,
//       { currentLocation: { lat, lng, updatedAt: new Date() } },
//       { new: true } // return updated document
//     ).populate("driver", "name email role");

//     if (!bus) return res.status(404).json({ message: "Bus not found" });

//     // Save history (optional)
//     await Location.create({ bus: bus._id, lat, lng });

//     const io = req.app.get("io");
//     if (io) {
//       io.emit("locationUpdate", {
//         busId: bus._id,
//         busNumber: bus.busNumber,
//         lat,
//         lng,
//         updatedAt: bus.currentLocation.updatedAt
//       });
//     }

//     res.json({
//       message: "Bus location updated",
//       busId: bus._id,
//       lat,
//       lng,
//       updatedAt: bus.currentLocation.updatedAt
//     });
//   } catch (error) {
//     console.error("UpdateBusLocation error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };



// controllers/busController.js
import Bus from "../models/Bus.js";
import Location from "../models/Location.js";

// ➕ Add a new bus
export const addbus = async (req, res) => {
  try {
    const { busNumber, driver, capacity, route } = req.body;

    if (!busNumber?.trim()) {
      return res.status(400).json({ message: "busNumber is required" });
    }

    const exists = await Bus.findOne({ busNumber });
    if (exists) {
      return res.status(400).json({ message: "Bus already exists" });
    }

    const bus = await Bus.create({ busNumber, driver, capacity, route });
    await bus.populate("driver", "name email role");

    res.status(201).json(bus);
  } catch (error) {
    console.error("AddBus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🚍 Get all buses
export const getbuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate("driver", "name email role");
    res.json(buses);
  } catch (error) {
    console.error("GetBuses error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get bus by ID
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("driver", "name email role");
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus);
  } catch (error) {
    console.error("getBusById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete bus (Admin only)
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error("deleteBus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📍 Update bus location & broadcast via Socket.IO
export const updateBusLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const bus = await Bus.findByIdAndUpdate(
      id,
      { currentLocation: { lat, lng, updatedAt: new Date() } },
      { new: true }
    ).populate("driver", "name email role");

    if (!bus) return res.status(404).json({ message: "Bus not found" });

    await Location.create({ bus: bus._id, lat, lng });

    const io = req.app.get("io");
    if (io) {
      io.emit("locationUpdate", {
        busId: bus._id,
        busNumber: bus.busNumber,
        lat,
        lng,
        updatedAt: bus.currentLocation.updatedAt,
      });
    }

    res.json({
      message: "Bus location updated",
      busId: bus._id,
      lat,
      lng,
      updatedAt: bus.currentLocation.updatedAt,
    });
  } catch (error) {
    console.error("UpdateBusLocation error:", error);
    res.status(500).json({ message: error.message });
  }
};
