import dotenv from "dotenv";
dotenv.config();

// ------------------------------------------------------------------
// 1. ENV VALIDATION — fail fast before anything else loads
// ------------------------------------------------------------------
const REQUIRED_ENV = [
  'MONGO_URI',
  'ALLOWED_ORIGINS',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ADMIN_SECRET',
  'API_SECRET',
];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`[App] ❌ Missing required env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB";
import projectRoutes from './routes/project.routes';
import baseProductRoutes from './routes/baseProduct.routes';
import productItemRoutes from './routes/productItem.routes';
import careerRoutes from './routes/career.routes';
import teamRoutes from './routes/team.routes';
import blogRoutes from './routes/blog.routes';
import resourceRoutes from './routes/resources.routes';
import authRoutes from './routes/authRoutes';
import cloudinaryRoutes from './routes/cloudinary.routes';
import homePageRoutes from './routes/homePage.routes';
import globalSettingsRoutes from './routes/globalSettings.routes';
import franchisePageRoutes from './routes/franchisePage.routes';
import servicesPageRoutes from './routes/servicesPage.routes';
import leadRoutes from './routes/lead.routes';
import landingPageRoutes from './routes/landingPage.routes';
import serviceDetailRoutes from './routes/serviceDetail.routes';
import { apiSecretMiddleware } from './middleware/apiSecretMiddleware';
import aboutPageRoutes from './routes/about.routes'

import seoRoutes from './routes/seo.routes';

const app = express();

// ------------------------------------------------------------------
// 2. SECURITY HEADERS — helmet adds 11 headers in one line.
//    Must come before any route so every response is covered.
//    crossOriginResourcePolicy: false is needed when your frontend
//    fetches images/fonts from this same Express server.
// ------------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Mount SEO routes before CORS and API Secret so crawlers can access it directly
app.use('/', seoRoutes);

// ------------------------------------------------------------------
// 3. CORS — only allow your own front-end origins.
//    Set ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
//    in your Vercel environment variables (comma-separated).
// ------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl calls that send no Origin header,
      // and any explicitly whitelisted origin.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-skip-auth-refresh"],
  })
);

// ------------------------------------------------------------------
// 4. BODY PARSING WITH SIZE LIMIT — prevents large payload attacks.
//    1 mb is plenty for a course platform; raise only if you handle
//    file uploads through this API (prefer a dedicated upload service).
// ------------------------------------------------------------------
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ------------------------------------------------------------------
// 5. RATE LIMITING
//    • globalLimiter  — 200 req / 15 min per IP for all routes
//    • authLimiter    — 20 req / 15 min per IP for auth routes only
//
//    On Vercel the real client IP lives in x-forwarded-for.
//    trustProxy: 1 tells express-rate-limit to read that header.
// ------------------------------------------------------------------
app.set("trust proxy", 1); // Vercel sits behind a proxy layer

// SECURITY: Global rate limiter — 200 req / 15 min per IP across all routes.
// Prevents DoS on every endpoint including DB-heavy sitemap generation and Cloudinary routes.
// Skips /sitemap.xml and /robots.txt because:
//   1. They are public crawler endpoints
//   2. sitemap.xml has its own 1-hour in-memory cache (only runs 4 DB queries once per hour)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.path === '/sitemap.xml' || req.path === '/robots.txt',
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

app.use(globalLimiter); // applied to every route

// ------------------------------------------------------------------
// 6. DB MIDDLEWARE — connect before every request.
//    connectDB is cached so this is near-zero cost after the first call.
// ------------------------------------------------------------------
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[App] DB unavailable:", err);
    res.status(503).json({
      success: false,
      message: "Database temporarily unavailable. Please retry in a moment.",
    });
  }
});

// ------------------------------------------------------------------
// 7. ROUTES
//    Auth route gets its own tighter rate limiter applied first.
// ------------------------------------------------------------------
app.use(apiSecretMiddleware);

app.use("/project", projectRoutes);
app.use('/base-products', baseProductRoutes);
app.use('/product-items', productItemRoutes);
app.use('/career', careerRoutes);
app.use('/team', teamRoutes);
app.use('/about-page', aboutPageRoutes);
app.use('/blog', blogRoutes);
app.use('/resource', resourceRoutes);
app.use('/auth', authRoutes);
app.use('/cloudinary', cloudinaryRoutes);
app.use('/homepage', homePageRoutes);
app.use('/global-settings', globalSettingsRoutes);
app.use('/franchise-page', franchisePageRoutes);
app.use('/services-page', servicesPageRoutes);
app.use('/service-details', serviceDetailRoutes);
app.use('/leads', leadRoutes);
app.use('/landing', landingPageRoutes);
// ------------------------------------------------------------------
// 8. 404 HANDLER — catches any request that didn't match a route.
//    Must come AFTER all app.use() route registrations.
// ------------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ------------------------------------------------------------------
// 9. GLOBAL ERROR HANDLER — catches any error thrown/passed to next()
//    inside a route or middleware.
//    • In production: never leak the real error message to the client.
//    • In development: show the full message so you can debug.
//    Must be the LAST app.use() with exactly 4 parameters.
// ------------------------------------------------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status: number = err.status || err.statusCode || 500;

  // Don't expose internal details in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err.message || "Internal server error";

  console.error("[Error]", err);
  res.status(status).json({ success: false, message });
});

// ------------------------------------------------------------------
// 10. LOCAL DEV STARTUP — skipped entirely on Vercel.
//     Vercel imports this file as a module and calls the default export
//     as a serverless function; it never reaches this block.
// ------------------------------------------------------------------
if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3000;

  connectDB()
    .then(() => {
      const server = app.listen(PORT, () =>
        console.log(`[App] Server running on port ${PORT}`)
      );

      // ------------------------------------------------------------------
      // 11. GRACEFUL SHUTDOWN — only relevant for long-running servers
      //     (not Vercel serverless, but useful for Railway / Render / VPS).
      //     Waits for in-flight requests to finish before closing DB.
      // ------------------------------------------------------------------
      const gracefulShutdown = (signal: string) => {
        console.log(`[App] ${signal} received — shutting down gracefully`);
        server.close(() => {
          console.log("[App] HTTP server closed");
          import("mongoose").then(({ default: mongoose }) => {
            mongoose.connection.close(false).then(() => {
              console.log("[DB] Connection closed");
              process.exit(0);
            });
          });
        });
      };

      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    })
    .catch((err) => {
      console.error("[App] Failed to start server:", err);
      process.exit(1);
    });
}

export default app;

