import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import PlannedExpenses from './pages/PlannedExpenses';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';
import GuestRoute from './layouts/GuestRoute';

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/',
        element: <LandingPage />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'budgets',
        element: <Budgets />,
      },
      {
        path: 'goals',
        element: <Goals />,
      },
      {
        path: 'debts',
        element: <Debts />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'investments',
        element: <Accounts />,
      },
      {
        path: 'planned-expenses',
        element: <PlannedExpenses />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },

]);
