# LeadFlow CRM

LeadFlow is a full-stack customer relationship management app for tracking leads through a sales pipeline and managing follow-up activities. It includes a React single-page frontend and an Express REST API backed by MongoDB.

## Features

- **Authentication:** Register, log in, view the current account, and log out. Passwords are hashed, and API sessions use JWTs.
- **Dashboard:** View total, active, won, and lost leads; pending and overdue follow-ups; recent leads; and lead counts by stage.
- **Lead management:** Create, view, edit, search, filter, paginate, and delete leads. Deleting a lead also deletes its associated activities.
- **Sales pipeline:** Track leads through `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, and `Lost`.
- **Activities:** Create and manage calls, emails, meetings, and tasks; set due dates and notes; filter activities by status or lead; and mark them pending or completed.
- **Account data isolation:** Each account can access only its own leads, activities, and dashboard data.
- **Responsive interface:** Protected dashboard, lead list and detail pages, lead forms, and activity management.

## Technology

- **Frontend:** React 18, Vite 5, React Router, Axios, Tailwind CSS, and `react-hot-toast`
- **Backend:** Node.js, Express 4, Mongoose, and MongoDB
- **API security:** JWT authentication, bcrypt password hashing, Helmet, CORS allowlisting, request validation, NoSQL sanitization, and rate limiting

## Requirements

- Node.js 18 or later and npm
- MongoDB locally or a MongoDB Atlas connection string

## Local setup

The backend and frontend are separate npm applications; install dependencies in each directory.

### 1. Configure and start the backend

In a terminal:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set your MongoDB connection string and a long, unique `JWT_SECRET`. For example:

```dotenv
PORT=9999
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/leadflow
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

The Vite development proxy in `frontend/vite.config.js` sends `/api` requests to `http://localhost:9999`, so use `PORT=9999` for the backend during local development. Alternatively, change the Vite proxy target to match another backend port. The backend's default port, when `PORT` is omitted, is `5000`.

Start the API:

```powershell
npm run dev
```

The API health check is available at [http://localhost:9999/health](http://localhost:9999/health).

### 2. Start the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (normally [http://localhost:5173](http://localhost:5173)), register an account, and start adding leads.

### Production builds

Build the frontend with:

```powershell
cd frontend
npm run build
```

Preview the production frontend locally with `npm run preview`. Run the API with `npm start` from `backend`. The frontend uses the relative API base `/api/v1`; in production, configure your web server or hosting platform to route that path to the backend. The Vite proxy is for local development only.

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Backend HTTP port. Use `9999` locally to match the Vite proxy, unless you change the proxy target. |
| `NODE_ENV` | No | — | Set to `development` for development logging; use `production` when deploying. |
| `MONGODB_URI` | Yes | — | MongoDB connection URI. |
| `JWT_SECRET` | Yes | — | Secret used to sign and verify JWTs. Use a unique, unpredictable value and keep it private. |
| `JWT_EXPIRES_IN` | No | `1d` | JWT lifetime, such as `1d` or `12h`. |
| `CLIENT_URL` | No | `http://localhost:5173` | Additional allowed frontend origin for API CORS. |

Do not commit `.env` or use development secrets in production. For Atlas, use the connection string supplied by your cluster and ensure the database user and network access rules permit the backend to connect.

## Application routes

| Page | Path | Purpose |
| --- | --- | --- |
| Login | `/login` | Sign in to an account |
| Register | `/register` | Create an account |
| Dashboard | `/dashboard` | View pipeline and follow-up summaries |
| Leads | `/leads` | Search and filter the lead list |
| Add lead | `/leads/new` | Create a lead |
| Lead details | `/leads/:id` | View an individual lead and its activities |
| Edit lead | `/leads/:id/edit` | Update a lead |
| Activities | `/activities` | View and manage follow-ups |

Dashboard pages require authentication. Unauthenticated users are redirected to the login page.

## REST API

All API routes are under `/api/v1`. Except for registration, login, and the health check, endpoints require a valid JWT. Send it as an `Authorization: Bearer <token>` header or as the `token` cookie; the frontend handles authentication automatically.

Successful responses use `{ "success": true, "message": "...", "data": { ... } }`. Errors use `{ "success": false, "message": "...", "errors": [] }`.

### Health and authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | API health check |
| `POST` | `/api/v1/auth/register` | Public | Register with `name`, `email`, and `password` |
| `POST` | `/api/v1/auth/login` | Public | Sign in with `email` and `password` |
| `GET` | `/api/v1/auth/me` | Protected | Get the current user |
| `POST` | `/api/v1/auth/logout` | Protected | Clear the authentication cookie |

Registration requires a 2–100 character name and a password of at least 6 characters.

### Leads

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/leads` | Protected | List leads; supports `search`, `stage`, `page`, and `limit` query parameters |
| `POST` | `/api/v1/leads` | Protected | Create a lead |
| `GET` | `/api/v1/leads/:id` | Protected | Get one lead |
| `PATCH` | `/api/v1/leads/:id` | Protected | Update a lead |
| `DELETE` | `/api/v1/leads/:id` | Protected | Delete a lead and its activities |

Lead fields:

- `name` (required), `company`, `email`, `phone`, `serviceInterest`, `source`, `budget`, and `stage`
- At least one of `email` or `phone` is required.
- `source`: `Website`, `Referral`, `Social Media`, `Cold Call`, `Email`, `Event`, or `Other`
- `stage`: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, or `Lost`
- Lead listing defaults to page `1` and limit `20`; `limit` must be between `1` and `100`.
- Search matches lead name and company, without case sensitivity.

### Activities

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/activities` | Protected | List activities; optionally filter by `status` or `leadId` |
| `POST` | `/api/v1/activities` | Protected | Create an activity associated with one of your leads |
| `PATCH` | `/api/v1/activities/:id` | Protected | Update activity details or status |
| `DELETE` | `/api/v1/activities/:id` | Protected | Delete an activity |

Activity creation requires `leadId`, `title`, an ISO 8601 `dueAt`, and `type`. Optional `notes` are limited to 1,000 characters. Valid types are `Call`, `Email`, `Meeting`, and `Task`; valid statuses are `Pending` and `Completed`. Changing status to completed records a completion time.

### Dashboard

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/dashboard/summary` | Protected | Return lead totals, pending and overdue follow-ups, the five most recent leads, and lead stage distribution |

## Project structure

```text
backend/
  config/          MongoDB connection
  controllers/     Authentication, lead, activity, and dashboard handlers
  middleware/      Authentication, error handling, and 404 handling
  models/          User, Lead, and Activity schemas
  routes/          Versioned API route definitions
  validators/      Request validation rules
  app.js           Express app and middleware setup
  server.js        Database connection and HTTP server startup
frontend/
  src/
    components/    Layout, lead form, and shared UI components
    context/       Authentication state
    layouts/       Authenticated and public layouts
    pages/         Application screens
    services/      API client and endpoint services
    App.jsx        Application routes and access guards
  vite.config.js   Vite configuration and API development proxy
```

## Security notes

- The API applies Helmet security headers, MongoDB input sanitization, request validation, a 10 KB JSON body limit, and CORS origin checks.
- General API traffic is limited to 200 requests per 15 minutes per client; authentication routes are limited to 20 requests per 15 minutes.
- Passwords are hashed with bcrypt. Tokens are issued in an HTTP-only cookie and included in authentication responses for the frontend.
- Use HTTPS, a strong private JWT secret, and appropriately restricted database credentials in production.
