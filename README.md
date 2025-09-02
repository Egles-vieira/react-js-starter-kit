# Road Guard

This project uses Node.js and React.

The client is built with [Vite](https://vitejs.dev/). API requests are
proxied to the backend using the `/api` prefix.

## Environment Variables

Create a `.env` file based on `.env.example` and set values as needed.

Required variables:

- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 25060)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database user password

Other variables used in the project include:

- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `JWT_SECRET` - Secret used to sign JWT tokens

## Available Pages

- **Agendamentos** – list, create/edit and toggle schedules.
- **Execuções** – table of execution history with status, duration and trace ID.
- **Arquivos Processados** – view processed files with basic filtering.
- **Erros** – exportable list of error entries.

All pages are currently public; authentication hooks can be added in the
future.





## Job Scheduling

The project now includes a robust job scheduling system powered by Bull and Redis. This system allows for background processing of tasks, such as sending notifications, generating reports, and more.

### Features

- **Persistent Job Queues:** Jobs are stored in Redis, ensuring they are not lost if the application restarts.
- **Automatic Retries:** Failed jobs are automatically retried with an exponential backoff strategy.
- **Concurrency Control:** The number of jobs processed simultaneously is limited to prevent system overload.
- **Real-time Monitoring:** The status of the job queue can be monitored in real-time via an API endpoint.
- **Manual Execution:** Jobs can be triggered manually via an API endpoint for on-demand execution.

### Monitoring

- **Queue Stats:** `GET /api/cron/queue/stats`
- **Job History:** `GET /api/cron/jobs`

### Manual Execution

- **Run Job:** `POST /api/cron/agendamentos/:id/run`


