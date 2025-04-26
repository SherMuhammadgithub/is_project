# Vercel Deployment Server

This is a server application for Vercel deployment with user authentication, booking management, and Duffel API proxy.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   - Make sure PostgreSQL is installed and running
   - Create a database named `is_project_db`
   - Run the SQL script to set up the tables:
     ```
     psql -U postgres -d is_project_db -f setup-db.sql
     ```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5000
     DUFFEL_TEST_API_KEY=your_duffel_api_key_here
     CORS_ORIGIN=http://localhost:3000
     
     # Database Configuration
     DB_HOST=localhost
     DB_USER=postgres
     DB_PASSWORD=postgres
     DB_NAME=is_project_db
     DB_PORT=5432
     ```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

### Testing the API
```
npm test
```

## API Endpoints

### User Routes
- `POST /api/users/signup` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/test` - Test the user router

### Booking Routes
- `GET /api/bookings/:username` - Get all bookings for a user
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/test` - Test the booking router

### Flight Routes
- `POST /api/flights/get-flight-offers` - Get flight offers from Duffel API
- `GET /api/flights/test` - Test the flight router

### Duffel API Proxy
- All requests to `/api` are proxied to the Duffel API

## Project Structure

- `index.js` - Main Express application
- `server.js` - Server entry point
- `controller/` - Controller functions
  - `userController.js` - User-related functionality
  - `bookingController.js` - Booking-related functionality
  - `flightController.js` - Flight-related functionality
- `router/` - Express routes
  - `userRouter.js` - User routes
  - `bookingRouter.js` - Booking routes
  - `flightRouter.js` - Flight routes
- `db/` - Database connection
  - `db.js` - PostgreSQL connection pool 