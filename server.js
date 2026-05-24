import express from 'express'; // Import express library
import cors from 'cors'; // Import cors library
import cookieParser from 'cookie-parser'; // Import cookie-parser library
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Import Database
import './controllers/db/db.js';
// Import Routine (Cron)
import { refreshDevicelists } from './controllers/cron/routine.js';

// Import Path Libraries
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

const port = 4000;

// Import Routes
import apiRoutes from './routes/api.js';

app.use(express.json({ limit: '100mb' })); //Set File Upload Size Limit
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Parse form data

app.use(express.static(path.join(__dirname, 'dist'))); // Serve Static Files

// SESSION MANAGEMENT
app.set('trust proxy', 1); // Trust First Proxy

// Enable CORS with Authorization header allowed
app.use(
  cors({
    allowedHeaders: ['Authorization', 'Content-Type'], // Allow 'Authorization' header
  })
);

// Required to parse cookies
app.use(cookieParser());

app.use('/api', apiRoutes);
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(port, async () => {
  console.log(' - Control V2 2026 Webserver - ');
  console.log(`Server running at:`);
  console.log(`- Local: http://localhost:${port}`);
  if (!process.env.APP_ENV) {
    console.warn(`PLEASE ADD APP_ENV TO ENVIRONMENT`);
  }
  // const result = await refreshDevicelists();
});
