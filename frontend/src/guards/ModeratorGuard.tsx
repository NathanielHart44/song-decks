import { useState, ReactNode, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
// components
import { PATH_AUTH, PATH_PAGE } from 'src/routes/paths';
import LoadingBackdrop from 'src/components/base/LoadingBackdrop';
import { MetadataContext } from 'src/contexts/MetadataContext';

// ----------------------------------------------------------------------

type ModeratorGuardProps = {
  children: ReactNode;
};

export function TesterGuard({ children }: ModeratorGuardProps) {
  const { currentUser } = useContext(MetadataContext);
  const { isAuthenticated, isInitialized } = useAuth();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

  if (!isInitialized || !currentUser) { return <LoadingBackdrop /> }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to={PATH_AUTH.root} />;
  }

  if (currentUser.tester === false) {
    return <Navigate to={PATH_PAGE.home} />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}

export function ModeratorGuard({ children }: ModeratorGuardProps) {
  const { currentUser } = useContext(MetadataContext);
  const { isAuthenticated, isInitialized } = useAuth();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

  if (!isInitialized || !currentUser) { return <LoadingBackdrop /> }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to={PATH_AUTH.root} />;
  }

  if (currentUser.moderator === false) {
    return <Navigate to={PATH_PAGE.home} />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}


type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const { currentUser } = useContext(MetadataContext);
  const { isAuthenticated, isInitialized } = useAuth();
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

  if (!isInitialized || !currentUser) { return <LoadingBackdrop /> }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Navigate to={PATH_AUTH.root} />;
  }

  if (currentUser.admin === false || currentUser.moderator === false) {
    return <Navigate to={PATH_PAGE.home} />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}