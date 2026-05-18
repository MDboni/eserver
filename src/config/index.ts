import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connectionString: process.env.DATABASE_URL as string,
  port: Number(process.env.PORT) || 3004,
};

export default config;