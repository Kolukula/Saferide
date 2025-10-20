// // configs/db.js
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();

// const connectDb = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`Saferide Database connected successfully: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('Saferide Database connection failed:', error.message);
//     process.exit(1); // stop process if DB connection fails
//   }
// };

// export default connectDb;




// configs/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Saferide Database connected successfully: ${conn.connection.host}`);

    // ---- 🔥 CLEANUP OLD INDEX ----
    const collection = conn.connection.db.collection('buses');
    const indexes = await collection.indexes();

    const oldIndex = indexes.find((idx) => idx.name === 'numberPlate_1');
    if (oldIndex) {
      await collection.dropIndex('numberPlate_1');
      console.log('🧹 Dropped obsolete index: numberPlate_1');
    } else {
      console.log('✅ No obsolete index found.');
    }

    // Recreate correct index for busNumber (if missing)
    const hasBusNumberIndex = indexes.find((idx) => idx.name === 'busNumber_1');
    if (!hasBusNumberIndex) {
      await collection.createIndex({ busNumber: 1 }, { unique: true });
      console.log('🔧 Created clean index on busNumber.');
    }

  } catch (error) {
    console.error('❌ Saferide Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDb;
