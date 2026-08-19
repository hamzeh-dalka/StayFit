import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Role } from './core/models/enums';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'auth/register-client',
    loadComponent: () =>
      import('./features/auth/register-client/register-client').then((m) => m.RegisterClient),
  },
  {
    path: 'auth/register-coach',
    loadComponent: () =>
      import('./features/auth/register-coach/register-coach').then((m) => m.RegisterCoach),
  },
  {
    path: 'coaches',
    loadComponent: () =>
      import('./features/coaches/coach-directory/coach-directory').then((m) => m.CoachDirectory),
  },
  {
    path: 'coaches/:id',
    loadComponent: () =>
      import('./features/coaches/coach-detail/coach-detail').then((m) => m.CoachDetail),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/authenticated-shell/authenticated-shell').then(
        (m) => m.AuthenticatedShell,
      ),
    children: [
      {
        path: 'dashboard/client',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/client-dashboard/client-dashboard').then(
            (m) => m.ClientDashboard,
          ),
      },
      {
        path: 'dashboard/coach',
        canActivate: [roleGuard],
        data: { roles: [Role.Coach], title: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/coach-dashboard/coach-dashboard').then(
            (m) => m.CoachDashboard,
          ),
      },
      {
        path: 'dashboard/admin',
        canActivate: [roleGuard],
        data: { roles: [Role.Admin, Role.SuperAdmin], title: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard,
          ),
      },
      {
        path: 'dashboard/system',
        canActivate: [roleGuard],
        data: { roles: [Role.SuperAdmin], title: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/system-dashboard/system-dashboard').then(
            (m) => m.SystemDashboard,
          ),
      },
      {
        path: 'meals',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Meals' },
        loadComponent: () =>
          import('./features/meals/meals-list/meals-list').then((m) => m.MealsList),
      },
      {
        path: 'workout-logs',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Workouts' },
        loadComponent: () =>
          import('./features/workout-logs/workout-logs-list/workout-logs-list').then(
            (m) => m.WorkoutLogsList,
          ),
      },
      {
        path: 'weight-logs',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Weight log' },
        loadComponent: () =>
          import('./features/weight-logs/weight-log-page/weight-log-page').then(
            (m) => m.WeightLogPage,
          ),
      },
      {
        path: 'goals',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Goals' },
        loadComponent: () => import('./features/goals/goals-page/goals-page').then((m) => m.GoalsPage),
      },
      {
        path: 'plans',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Plans' },
        loadComponent: () =>
          import('./features/plans/plans-page/plans-page').then((m) => m.PlansPage),
      },
      {
        path: 'my-coaches',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'My coaches' },
        loadComponent: () =>
          import('./features/coaches/my-coaches/my-coaches').then((m) => m.MyCoaches),
      },
      {
        path: 'coaches-browse',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Browse coaches' },
        loadComponent: () =>
          import('./features/coaches/coaches-browse/coaches-browse').then((m) => m.CoachesBrowse),
      },
      {
        path: 'coaches-browse/:id',
        canActivate: [roleGuard],
        data: { roles: [Role.Client], title: 'Browse coaches' },
        loadComponent: () =>
          import('./features/coaches/coach-browse-detail/coach-browse-detail').then(
            (m) => m.CoachBrowseDetail,
          ),
      },
      {
        path: 'my-clients',
        canActivate: [roleGuard],
        data: { roles: [Role.Coach], title: 'My clients' },
        loadComponent: () =>
          import('./features/coaches/my-clients/my-clients').then((m) => m.MyClients),
      },
      {
        path: 'pending-requests',
        canActivate: [roleGuard],
        data: { roles: [Role.Coach], title: 'Pending requests' },
        loadComponent: () =>
          import('./features/coaches/pending-requests/pending-requests').then(
            (m) => m.PendingRequests,
          ),
      },
      {
        path: 'nutrition-plans',
        canActivate: [roleGuard],
        data: { roles: [Role.Coach], title: 'Nutrition plans' },
        loadComponent: () =>
          import('./features/nutrition-plans/nutrition-plans-page/nutrition-plans-page').then(
            (m) => m.NutritionPlansPage,
          ),
      },
      {
        path: 'workout-plans',
        canActivate: [roleGuard],
        data: { roles: [Role.Coach], title: 'Workout plans' },
        loadComponent: () =>
          import('./features/workout-plans/workout-plans-page/workout-plans-page').then(
            (m) => m.WorkoutPlansPage,
          ),
      },
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: [Role.SuperAdmin], title: 'Users' },
        loadComponent: () =>
          import('./features/admin/users-page/users-page').then((m) => m.UsersPage),
      },
      {
        path: 'admin/pending-coaches',
        canActivate: [roleGuard],
        data: { roles: [Role.Admin, Role.SuperAdmin], title: 'Pending coaches' },
        loadComponent: () =>
          import('./features/admin/pending-coaches-page/pending-coaches-page').then(
            (m) => m.PendingCoachesPage,
          ),
      },
      {
        path: 'food-items',
        canActivate: [roleGuard],
        data: { roles: [Role.Admin], title: 'Food items' },
        loadComponent: () =>
          import('./features/admin/food-items-page/food-items-page').then(
            (m) => m.FoodItemsPage,
          ),
      },
      {
        path: 'exercises',
        canActivate: [roleGuard],
        data: { roles: [Role.Admin], title: 'Exercises' },
        loadComponent: () =>
          import('./features/admin/exercises-page/exercises-page').then(
            (m) => m.ExercisesPage,
          ),
      },
      {
        path: 'messages',
        canActivate: [roleGuard],
        data: { roles: [Role.Client, Role.Coach], title: 'Messages' },
        loadComponent: () =>
          import('./features/messages/messages-page/messages-page').then((m) => m.MessagesPage),
      },
      {
        path: 'messages/:userId',
        canActivate: [roleGuard],
        data: { roles: [Role.Client, Role.Coach], title: 'Messages' },
        loadComponent: () =>
          import('./features/messages/messages-page/messages-page').then((m) => m.MessagesPage),
      },
    ],
  },
  {
    path: 'meals/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Client] },
    loadComponent: () =>
      import('./features/meals/meal-detail/meal-detail').then((m) => m.MealDetail),
  },
  {
    path: 'workout-logs/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Client] },
    loadComponent: () =>
      import('./features/workout-logs/workout-log-detail/workout-log-detail').then(
        (m) => m.WorkoutLogDetail,
      ),
  },
  {
    path: 'profile/edit-client',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Client] },
    loadComponent: () =>
      import('./features/profile/edit-client-profile/edit-client-profile').then(
        (m) => m.EditClientProfile,
      ),
  },
  {
    path: 'profile/edit-coach',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Coach] },
    loadComponent: () =>
      import('./features/profile/edit-coach-profile/edit-coach-profile').then(
        (m) => m.EditCoachProfile,
      ),
  },
];
