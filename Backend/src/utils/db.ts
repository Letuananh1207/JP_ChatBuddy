import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    // Kiểm tra nếu không có URI thì dừng chương trình ngay lập tức
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    }
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  }
};

export default connectDB;
