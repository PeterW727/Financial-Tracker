# Financial-Tracker

This project is a full-stack financial tracking application with a Spring Boot backend and a Next.js frontend.

## Getting Started with Docker

You can run the entire stack using Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Running the application

1. Clone the repository (if you haven't already).
2. From the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Once the containers are running:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:8080](http://localhost:8080)
   - Database (MySQL): `localhost:3306`

### Configuration

The application uses the following default credentials for the database:
- **Username:** root
- **Password:** root
- **Database:** FinancialTracker

These can be modified in the `docker-compose.yml` file.