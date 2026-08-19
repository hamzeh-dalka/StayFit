# StayFit

StayFit is a full-stack fitness and nutrition platform that connects coaches with clients. Coaches build personalized nutrition and workout plans, track client progress, and communicate directly through the app. Clients log meals and workouts, monitor their weight and goals, and stay connected with their coach — all in one place.

Built with a **.NET Web API** backend and an **Angular** frontend, StayFit supports four distinct roles — **Client**, **Coach**, **Admin**, and **SuperAdmin** — each with its own dashboard, permissions, and workflows.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Roles & Permissions](#roles--permissions)
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)

---

## Tech Stack

**Backend**
- ASP.NET Core Web API (.NET)
- Entity Framework Core + SQL Server
- JWT Bearer Authentication
- BCrypt password hashing
- Scalar (OpenAPI documentation)

**Frontend**
- Angular (Standalone Components)
- Angular Material
- RxJS
- Signal-based state management

---

## Roles & Permissions

| Role | Description |
|---|---|
| **Client** | Logs meals and workouts, tracks weight and goals, follows coach-assigned nutrition/workout plans, messages their coach(es) |
| **Coach** | Manages their client roster, accepts/declines client requests, builds nutrition and workout plans, messages clients |
| **Admin** | Manages the reference database (food items, exercises) and approves new coach registrations |
| **SuperAdmin** | Full platform oversight — system-wide statistics, user management, and permanent account deletion |

New coach accounts require **Admin approval** before they can log in, ensuring only vetted coaches are active on the platform.

---

## Features

### For Clients
- Personal dashboard with daily calorie, weight, and goal summaries
- Meal logging with per-item calorie/macro breakdown
- Workout logging with sets/reps per exercise
- Weight tracking with a visual trend chart
- Goal setting with progress tracking
- Browse and request coaches by specialty
- View coach-assigned nutrition and workout plans, filterable by day of week
- Direct messaging with connected coaches
- In-app notifications

### For Coaches
- Dashboard summarizing active clients, pending requests, and active plans
- Accept or decline incoming client requests
- Build and manage nutrition plans (food items + quantities per day)
- Build and manage workout plans (exercises + sets/reps per day)
- Direct messaging with clients

### For Admins
- Platform-wide stats dashboard
- Full CRUD management of the food item reference database
- Full CRUD management of the exercise reference database
- Review and approve/reject pending coach registrations

### For SuperAdmins
- System-wide dashboard (users, coaches, clients, plans, messages, pending requests)
- Full user management with search and pagination
- Create new Admin accounts
- Permanently delete user accounts

---

## Screenshots

### Landing & Authentication

**Landing Page**
![Landing Page](Frontend/stayfit/src/app/screenshots/images-stayfit/landing-screen.png)

**Login**
![Login](Frontend/stayfit/src/app/screenshots/images-stayfit/login.png)

**Register as Client**
![Register as Client](Frontend/stayfit/src/app/screenshots/images-stayfit/register-client.png)

**Register as Coach**
![Register as Coach](Frontend/stayfit/src/app/screenshots/images-stayfit/register-coach.png)

**Browse Coaches**
![Browse Coaches](Frontend/stayfit/src/app/screenshots/images-stayfit/browse-coaches.png)

---

### Client

**Dashboard**
![Client Dashboard](Frontend/stayfit/src/app/screenshots/images-stayfit/client-dashboard.png)

**Meals**
![Client Meals](Frontend/stayfit/src/app/screenshots/images-stayfit/client-meals.png)

**Workouts**
![Client Workouts](Frontend/stayfit/src/app/screenshots/images-stayfit/client-workouts.png)

**Weight Log**
![Client Weight Log](Frontend/stayfit/src/app/screenshots/images-stayfit/client-weight-log.png)

**Goals**
![Client Goals](Frontend/stayfit/src/app/screenshots/images-stayfit/client-goals.png)

**Plans**
![Client Plans](Frontend/stayfit/src/app/screenshots/images-stayfit/client-plans.png)
![Client Plans - Detail](Frontend/stayfit/src/app/screenshots/images-stayfit/client-plans2.png)

**My Coaches**
![Client My Coaches](Frontend/stayfit/src/app/screenshots/images-stayfit/client-myCoaches.png)

**Messages**
![Client Messages](Frontend/stayfit/src/app/screenshots/images-stayfit/client-messages.png)

---

### Coach

**Dashboard**
![Coach Dashboard](Frontend/stayfit/src/app/screenshots/images-stayfit/coach-dashboard.png)

**My Clients**
![Coach My Clients](Frontend/stayfit/src/app/screenshots/images-stayfit/coach-myClients.png)

**Pending Requests**
![Coach Pending Requests](Frontend/stayfit/src/app/screenshots/images-stayfit/coach-pending-requests.png)

**Nutrition Plans**
![Coach Nutrition Plans](Frontend/stayfit/src/app/screenshots/images-stayfit/coach-nutritionPlans.png)

**Workout Plans**
![Coach Workout Plans](Frontend/stayfit/src/app/screenshots/images-stayfit/coach-workoutPlans.png)

**Messages**
![Coach Messages](Frontend/stayfit/src/app/screenshots/images-stayfit/coach-messages.png)

---

### Admin

**Dashboard**
![Admin Dashboard](Frontend/stayfit/src/app/screenshots/images-stayfit/admin-dashboard.png)

**Food Items**
![Admin Food Items](Frontend/stayfit/src/app/screenshots/images-stayfit/admin-food-items.png)

**Exercises**
![Admin Exercises](Frontend/stayfit/src/app/screenshots/images-stayfit/admin-exercises.png)

**Pending Coach Approvals**
![Admin Pending Coaches](Frontend/stayfit/src/app/screenshots/images-stayfit/admin-pending-coaches.png)

---

### SuperAdmin

**Dashboard**
![SuperAdmin Dashboard](Frontend/stayfit/src/app/screenshots/images-stayfit/superAdmin-dashboard.png)

**User Management**
![SuperAdmin Users](Frontend/stayfit/src/app/screenshots/images-stayfit/superAdmin-users.png)

---

## Project Architecture

### Backend

The API follows a clean, consistent controller structure:

- **Shared `BaseApiController`** — centralizes common logic (current user/role resolution, client/coach profile lookup, ownership and relationship checks) used across every controller.
- **DTO-based contracts** — every endpoint returns purpose-built DTOs rather than raw entities, keeping the API surface explicit and secure (e.g. password hashes are never exposed).
- **Role-based authorization** — every endpoint is scoped with `[Authorize(Roles = "...")]`, with ownership checks enforced in code for endpoints where role alone isn't sufficient (e.g. a client can only see their own meals).
- **Referential integrity** — foreign key relationships use `Restrict` delete behavior wherever cascading deletes could silently destroy historical data (meals, logs, plans), with explicit "in use" checks before allowing deletion of reference data like food items or exercises.

**Core entities:** Users, CoachProfiles, ClientProfiles, CoachClients, FoodItems, Exercises, Meals, MealItems, WorkoutLogs, WorkoutLogItems, WeightLogs, Goals, NutritionPlans, PlanMealItems, WorkoutPlans, PlanExerciseItems, Messages, Notifications.

### Frontend

- **Standalone Angular components** throughout, with lazy-loaded routes.
- **Signal-based `AuthService`** decodes and tracks the JWT client-side, exposing `isLoggedIn`, `currentUser`, and `currentRole` as reactive signals.
- **Route guards** (`authGuard`, `roleGuard`) enforce authentication and role restrictions at the routing level, mirroring the backend's authorization rules.
- **Shared authenticated shell** (collapsible sidebar + top navbar with notifications and account menu) wraps every role-specific page, with nav links generated dynamically per role.
- **A shared `BaseApi` service** centralizes HTTP call patterns, with one typed service per backend controller (`Meals`, `WorkoutLogs`, `CoachClient`, `Dashboard`, etc.).
- Consistent design system across the app: a single color palette, shared button/dialog/table patterns, and reusable components (registration menu, autocomplete search, item lists) rather than duplicated logic per page.

---

## Getting Started

### Backend

The API will be available at `https://localhost:7083`, with interactive API documentation at `https://localhost:7083/scalar/v1`.

The app will be available at `http://localhost:4200`.

> Ensure the `apiUrl` in `src/environments/environment.ts` matches the backend's running port.

---

## API Overview

| Controller | Responsibility |
|---|---|
| `AuthController` | Registration (Client/Coach/Admin), login |
| `UsersController` | User profile, admin user management, coach approval |
| `CoachProfilesController` / `ClientProfilesController` | Profile viewing and editing |
| `CoachClientController` | Coach-client connection requests |
| `FoodItemsController` / `ExercisesController` | Reference data (browsable publicly, admin-managed) |
| `MealsController` / `WorkoutLogsController` | Client activity logging |
| `WeightLogsController` / `GoalsController` | Progress tracking |
| `NutritionPlansController` / `WorkoutPlansController` | Coach-authored plans |
| `MessagesController` | Direct messaging |
| `NotificationsController` | In-app notifications |
| `DashboardController` | Role-specific and system-wide statistics |

---

## License

Hamzeh Dalkamony
dalkamonyhamzeh@gmail.com
