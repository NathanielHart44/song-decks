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

function withAuthGuard(element: JSX.Element) { return <AuthGuard>{element}</AuthGuard> };

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        { path: 'login', element: (<GuestGuard><Login /></GuestGuard>) },
        { path: 'register', element: (<GuestGuard><Register /></GuestGuard>) },
      ],
    },
    {
      path: '',
      children: [
        { element: withAuthGuard(<Navigate to={PATH_AFTER_LOGIN} replace />), index: true },
        { path: 'home', element: withAuthGuard(<Home />) },
        { path: 'game', element: withAuthGuard(<Game />) },
        { path: 'game/:gameID', element: withAuthGuard(<Game />) },
        { path: 'select-deck', element: withAuthGuard(<SelectDeck />) },
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
