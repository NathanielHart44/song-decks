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
import ManageContent from 'src/pages/ManageContent';
import ModeratorGuard from 'src/guards/ModeratorGuard';
import AdminPage from 'src/pages/AdminPage';
import LandingPage from 'src/pages/LandingPage';

// ----------------------------------------------------------------------

function withAuthGuard(element: JSX.Element) { return <AuthGuard>{element}</AuthGuard> };
function withModeratorGuard(element: JSX.Element) { return <ModeratorGuard>{element}</ModeratorGuard> };
function withGuestGuard(element: JSX.Element) { return <GuestGuard>{element}</GuestGuard> }

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        { path: 'login', element: (withGuestGuard(<Login />)) },
        { path: 'register', element: (withGuestGuard(<Register />)) },
      ],
    },
    {
      path: '',
      children: [
        // { element: withAuthGuard(<Navigate to={PATH_AFTER_LOGIN} replace />), index: true },
        { path: 'landing', element: withGuestGuard(<LandingPage />) },
        { path: 'home', element: withAuthGuard(<Home />) },
        { path: 'game', element: withAuthGuard(<Game />) },
        { path: 'manage', element: withModeratorGuard(<ManageContent />) },
        { path: 'moderator', element: withModeratorGuard(<AdminPage />) },
        { path: 'game/:gameID', element: withAuthGuard(<Game />) },
        { path: 'select-deck', element: withAuthGuard(<SelectDeck />) },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    {
      path: '/',
      children: [
        { element: <Navigate to="/landing" replace />, index: true },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
