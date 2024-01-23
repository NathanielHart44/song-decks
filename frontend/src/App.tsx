import MainStyle from './components/MainStyle';
import NavBar from './components/nav/NavBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeLocalization from './components/ThemeLocalization';
import HotJar from './components/user-tracking/HotJar';
import Pendo from './components/user-tracking/Pendo';
import AppInstallProvider from './contexts/AppInstallContext';
import GameProvider from './contexts/GameContext';
import ListBuilderProvider from './contexts/ListBuilderContext';
import MetadataProvider from './contexts/MetadataContext';
import Router from './routes';
import ThemeProvider from './theme';

import { initializeBrotli } from './utils/convertList';

// ----------------------------------------------------------------------

function App() {

  initializeBrotli();

  return (
    <ThemeProvider>
      <ThemeLocalization>
        <MetadataProvider>
          <AppInstallProvider>
            <GameProvider>
              <ListBuilderProvider>
                <NotistackProvider>
                  <Pendo />
                  <HotJar />
                  <NavBar />
                  <MainStyle>
                    <Router />
                  </MainStyle>
                </NotistackProvider>
              </ListBuilderProvider>
            </GameProvider>
          </AppInstallProvider>
        </MetadataProvider>
      </ThemeLocalization>
    </ThemeProvider>
  );
}

export default App;
