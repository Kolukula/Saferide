import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now }
});

const Location = mongoose.model("Location", LocationSchema);
export default Location;
