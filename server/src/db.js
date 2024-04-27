import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    if (connectionInstance) {
      console.log(
        `\n Mongo_DB Connected !! DB HOST : ${connectionInstance.connection.host}`
      );
    }
  } catch (error) {
    console.log(`Error while connecting to monodb ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
