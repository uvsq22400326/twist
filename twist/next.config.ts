import dotenv from "dotenv";

dotenv.config();

const nextConfig = {
  env: {
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
