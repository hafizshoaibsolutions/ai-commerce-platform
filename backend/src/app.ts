import express, { Application } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import errorMiddleware from "./middlewares/error.middleware";

const app: Application = express();

app.use(helmet());

app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
