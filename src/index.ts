import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.route";
import patientRoutes from "./routes/patient.route";
import centerRoutes from "./routes/center.route";
import doctorRoutes from "./routes/doctor.route";
import cors from "cors";
import session from "express-session";
import passport from "passport";

const corsConfig = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
dotenv.config();

const app = express();
app.options("", cors(corsConfig));
app.use(cors(corsConfig));

connectDB();

app.use(express.json());
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/center", centerRoutes);
app.use("/api/doctor", doctorRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
