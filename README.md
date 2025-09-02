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


