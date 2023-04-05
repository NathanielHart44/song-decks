import { Navigate, useRoutes } from 'react-router-dom';
import { PATH_AFTER_LOGIN } from 'src/config';
// pages
import NotFound from 'src/pages/NotFound';
import Home from 'src/pages/Home';
import Game from 'src/pages/Game';
import Login from 'src/pages/Login';
import Register from 'src/pages/Register';
import GuestGuard from 'src/guards/GuestGuard';
import AuthGuard from 'src/guards/AuthGuard';
import SelectDeck from 'src/pages/SelectDeck';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (<GuestGuard><Login /></GuestGuard>),
        },
        {
          path: 'register',
          element: (<GuestGuard><Register /></GuestGuard>),
        },
      ],
    },
    {
      path: '',
      children: [
        { element: (<AuthGuard><Navigate to={PATH_AFTER_LOGIN} replace /></AuthGuard>), index: true },
        { path: 'home', element: (<AuthGuard><Home /></AuthGuard>) },
        { path: 'game', element: (<AuthGuard><Game /></AuthGuard>) },
        { path: 'select-deck', element: (<AuthGuard><SelectDeck /></AuthGuard>) },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    {
      path: '/',
      children: [
        { element: <Navigate to="/home" replace />, index: true },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
