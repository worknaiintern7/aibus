# AIBus

Bus ticket booking platform with live inventory from the Mantis GDS (iamgds.com).

| Folder | What it is | Dev port | Docker port |
|---|---|---|---|
| `backend/` | Spring Boot REST API (Java, PostgreSQL) | 8080 | 8080 |
| `customer/` | Customer booking site (React + Vite) | 5173 | 3000 |
| `admin/` | Admin panel (React + Vite) | 5174 | 3001 |
| `agent/` | B2B agent partner portal (React + Vite) | 5175 | 3002 |

The dev ports are fixed (`strictPort`): an app fails to start instead of moving to another app's port.

## Run locally

Requirements: Java 17 or newer (Docker and CI use 21), Node 20+, PostgreSQL with a database named `aibus_db`.

1. Create `backend/.env` (git-ignored):

   ```ini
   DB_PASSWORD=your-postgres-password
   AIBUS_CLIENT_ID=your-mantis-client-id
   AIBUS_CLIENT_SECRET=your-mantis-client-secret
   ```

   The Mantis access token is generated from the client id and secret at runtime and refreshed automatically.

2. Start the backend:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. Start the frontends, each in its own terminal:

   ```bash
   cd customer && npm install && npm run dev   # http://localhost:5173
   cd admin    && npm install && npm run dev   # http://localhost:5174
   cd agent    && npm install && npm run dev   # http://localhost:5175
   ```

Each frontend reads `VITE_API_BASE_URL` (default `http://localhost:8080`). The customer site sends `/agent` to `VITE_AGENT_PORTAL_URL`; the agent portal links back to `VITE_CUSTOMER_APP_URL`. See the `.env.example` file in each app.

## Booking flow on live buses

1. `GET /api/buses/search` returns local schedules plus live GDS buses (`provider: "GDS"`).
2. `GET /api/gds/buses/{busId}` returns the operator's seat chart, per-seat fares, boarding and dropping points.
3. `POST /api/gds/bookings/hold` holds the seats with the operator. Fares are read from the live chart on the server.
4. `POST /api/gds/bookings/{reference}/confirm` issues the ticket (operator PNR and ticket number).
5. `GET /api/gds/bookings/{reference}/cancellation` shows the refund; `POST /api/bookings/{reference}/cancel` cancels.

## Tests

```bash
cd backend && mvn test                 # needs the local database
cd customer && npm run lint && npm run build
```

Live end-to-end check against the Mantis API. It books one real seat on the first live bus and cancels it again, so it moves money on the agent balance:

```bash
python scripts/e2e_live_booking.py http://localhost:8080
```

## Deploy

`docker compose up -d --build` starts PostgreSQL, the backend and the three frontends. Production settings come from a root `.env` file; start from `.env.production.example`. Nginx templates are in `deploy/nginx/` and the full walkthrough is in `docs/DEPLOYMENT_GUIDE.md`. Pushing to `main` deploys to the VPS through `.github/workflows/deploy.yml`.

Before going public:

- Payment is simulated. Connect a real payment gateway between the hold and confirm steps, because every confirmed booking issues a real ticket from the Mantis agent balance.
- Agent accounts and enquiries are kept in memory on the backend and are lost on restart.
- Change the seeded admin password and set a strong `DB_PASSWORD`.
