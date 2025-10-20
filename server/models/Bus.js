// import mongoose from "mongoose";

// const BusSchema = new mongoose.Schema({
//   busNumber: { type: String, required: true, unique: true, trim: true },
//   route: { type: String, default: "" },
//   driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   capacity: { type: Number, default: 0 },
//   currentLocation: {
//     lat: { type: Number },
//     lng: { type: Number },
//     updatedAt: { type: Date }
//   }
// }, { timestamps: true });

// const Bus = mongoose.model("Bus", BusSchema);
// export default Bus;


// models/Bus.js
import mongoose from "mongoose";

const BusSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, "Bus number is required"],
      unique: true,
      trim: true,
    },
    route: { type: String, default: "" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    capacity: { type: Number, default: 0 },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Remove old invalid indexes if they exist
BusSchema.pre("save", async function (next) {
  if (this.isNew && !this.busNumber) {
    return next(new Error("Bus number is required"));
  }
  next();
});

const Bus = mongoose.model("Bus", BusSchema);
export default Bus;
