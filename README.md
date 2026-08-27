# Financial-Tracker

This project is a full-stack financial tracking application with a Spring Boot backend and a Next.js frontend.

## Getting Started with Docker

You can run the entire stack using Docker Compose.

### Method 1: Instant Access (Recommended for Users)
If you just want to run the application without downloading the source code, download the `docker-compose.hub.yml` file and run:
```bash
docker compose -f docker-compose.hub.yml up
```

### Method 2: Development (Build from Source)
1. Clone the repository.
2. From the root directory, run:
   ```bash
   docker compose up --build
   ```

### Accessing the Application
Once the containers are running:
- **Frontend:** [http://localhost:3001](http://localhost:3001)
- **API:** [http://localhost:8081](http://localhost:8081)
- **Database (MySQL):** `localhost:3308`

### Configuration

The application uses the following default credentials for the database:
- **Username:** root
- **Password:** root
- **Database:** FinancialTracker

These can be modified in the `docker-compose.yml` file.

## Publishing to Docker Hub (For Project Owner)

If you have made changes to the code and want to update the images available to others:

1. **Login to Docker Hub:**
   ```bash
   docker login
   ```

2. **Build the images:**
   ```bash
   docker compose build
   ```

3. **Push the images:**
   ```bash
   docker compose push
   ```

This will upload the latest versions of your `api` and `frontend` images to your Docker Hub repository.