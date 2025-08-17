import MainStyle from './components/MainStyle';
import NavBar from './components/nav/NavBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeLocalization from './components/ThemeLocalization';
import HotJar from './components/user-tracking/HotJar';
import Pendo from './components/user-tracking/Pendo';
import AppInstallProvider from './contexts/AppInstallContext';
import GameProvider from './contexts/GameContext';
import MetadataProvider from './contexts/MetadataContext';
import Router from './routes';
import ThemeProvider from './theme';


// ----------------------------------------------------------------------

function App() {

  // List-builder removed. No initialization needed.

  return (
    <ThemeProvider>
      <ThemeLocalization>
        <MetadataProvider>
          <AppInstallProvider>
            <GameProvider>
                <NotistackProvider>
                  <Pendo />
                  <HotJar />
                  <NavBar />
                  <MainStyle>
                    <Router />
                  </MainStyle>
                </NotistackProvider>
            </GameProvider>
          </AppInstallProvider>
        </MetadataProvider>
      </ThemeLocalization>
    </ThemeProvider>
  );
}

export default App;
