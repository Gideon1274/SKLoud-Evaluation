# TaskFlow — Team To-Do List Application

TaskFlow is a full-stack task management application built as a team intern project. It lets a user
sign up, log in, and manage their own tasks on a Kanban-style board.

Each user can create tasks with a title, optional description, due date, and priority, then move
them across three columns: **To Do**, **In Progress**, and **Completed**.

## Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Frontend | Vue.js 3 + Vite |
| Backend  | AdonisJS 7 (TypeScript) |
| Database | PostgreSQL |

## Features

- **Authentication** — sign up and log in with email and password. Sessions use bearer tokens.
- **Task CRUD** — create, view, edit, and delete tasks.
- **Task fields** — title, optional description, due date (required), and priority (low / medium / high).
- **Status tracking** — To Do, In Progress, Completed, shown as board columns.
- **Drag & drop** — move tasks between columns (with swipe support on touch devices).
- **Filters & search** — filter by status and priority, search by title or description.
- **Overdue highlighting** — tasks past their due date are flagged.
- **Safe delete** — deletion asks for confirmation before removing a task.
- **States** — loading, empty, and error states are handled in the UI.
- **Per-user data** — each user only sees their own tasks.

## Project Structure

```
SKLoud-Evalution/
├── backend/          # AdonisJS API + PostgreSQL
│   ├── app/          # controllers, models, validators, middleware
│   ├── config/       # app, database, auth, cors, ...
│   ├── database/     # migrations
│   ├── start/        # routes, kernel, env
│   └── .env.example  # environment template
└── frontend/         # Vue 3 + Vite client
    └── src/
        ├── components/   # LoginPage, TaskBoard, TaskCard, TaskModal, ConfirmModal
        ├── composables/  # useAuth, useTasks, useDragDrop, useSwipe
        └── services/     # api client (axios)
```

## Prerequisites

- **Node.js** 20 or newer
- **npm**
- **PostgreSQL** 14 or newer, running locally

## Getting Started

Clone the repository and install dependencies in both apps.

```bash
git clone https://github.com/Gideon1274/SKLoud-Evaluation.git
cd SKLoud-Evalution
```

### 1. Database

Create an empty PostgreSQL database (the app expects one named `tasks`).

```sql
CREATE DATABASE tasks;
```

### 2. Backend (AdonisJS)

```bash
cd backend
npm install

# Create your local env file from the template
# Windows (PowerShell)
Copy-Item .env.example .env
# macOS / Linux
cp .env.example .env
```

Edit `backend/.env` and set your database credentials, then generate a secure.`APP_KEY`:

```bash
node ace generate:key
```

This writes a fresh random `APP_KEY` into your `.env` file. Run it once after creating the env file.

Run the migrations, then start the API.

```bash
node ace migration:run
npm run dev
```

The API runs at **http://localhost:3333**.

### 3. Frontend (Vue)

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The web app runs at **http://localhost:5173**.

Open that URL, sign up for an account, and start creating tasks.

## Environment Variables

Backend variables live in `backend/.env` (created from `backend/.env.example`).
**Never commit your real `.env` file** — only the example is tracked in Git.

| Variable       | Description                                   | Example              |
| -------------- | --------------------------------------------- | -------------------- |
| `PORT`         | Port the API listens on                       | `3333`               |
| `HOST`         | Host the API binds to                         | `localhost`          |
| `NODE_ENV`     | Environment mode                              | `development`        |
| `APP_KEY`      | Secret key for encryption (generate your own) | random string        |
| `APP_URL`      | Public URL of the API                         | `http://localhost:3333` |
| `SESSION_DRIVER` | Session driver                              | `cookie`             |
| `DB_HOST`      | PostgreSQL host                               | `127.0.0.1`          |
| `DB_PORT`      | PostgreSQL port                               | `5432`               |
| `DB_USER`      | PostgreSQL user                               | `postgres`           |
| `DB_PASSWORD`  | PostgreSQL password                           | your password        |
| `DB_DATABASE`  | Database name                                 | `tasks`              |

The frontend points at the API via the base URL in `frontend/src/services/api.js`
(`http://localhost:3333/api`).

## Database Migrations

Migrations live in `backend/database/migrations/` and create the `users`, `access_tokens`, and
`tasks` tables.

```bash
cd backend
node ace migration:run       # apply all migrations
node ace migration:rollback  # roll back the last batch
node ace migration:status    # show migration status
```

The `tasks` table stores `title`, `description`, `status`, `priority`, `due_date`, and a `user_id`
foreign key linking each task to its owner.

### Seed data (optional)

This project ships without seeders. To add sample data, create a seeder:

```bash
cd backend
node ace make:seeder task
node ace db:seed
```

## API Overview

All routes are prefixed with `/api`.

| Method | Endpoint             | Auth | Description                     |
| ------ | -------------------- | ---- | ------------------------------- |
| POST   | `/auth/signup`       | No   | Register a new account          |
| POST   | `/auth/login`        | No   | Log in and receive a token      |
| GET    | `/account/profile`   | Yes  | Get the current user            |
| POST   | `/account/logout`    | Yes  | Revoke the current token        |
| GET    | `/tasks`             | Yes  | List tasks (optional `status`, `priority` query params) |
| POST   | `/tasks`             | Yes  | Create a task                   |
| PUT    | `/tasks/:id`         | Yes  | Update a task                   |
| DELETE | `/tasks/:id`         | Yes  | Delete a task                   |

## Available Scripts

### Backend (`backend/`)

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start API with hot reload          |
| `npm run build`      | Build for production               |
| `npm start`          | Run the production build           |
| `npm test`           | Run tests                          |
| `npm run typecheck`  | Type-check the project             |
| `npm run lint`       | Lint the code                      |

### Frontend (`frontend/`)

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview the production build |

## Manual Test Checklist

- [ ] Sign up with a new account and land on the board.
- [ ] Log out and log back in with the same credentials.
- [ ] Create a task (title, description, due date, priority).
- [ ] Confirm the due date is required when creating a task.
- [ ] Edit a task and change its status.
- [ ] Drag a task between columns; verify the change persists after reload.
- [ ] Filter by status and priority, and search by title.
- [ ] Delete a task and confirm the confirmation dialog appears.
- [ ] Reload the page and verify tasks persist.
- [ ] Verify a second user only sees their own tasks.
