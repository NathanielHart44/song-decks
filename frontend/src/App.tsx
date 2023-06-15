import MainStyle from './components/MainStyle';
import NavBar from './components/NavBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeLocalization from './components/ThemeLocalization';
import HotJar from './components/user-tracking/HotJar';
import Pendo from './components/user-tracking/Pendo';
import GameProvider from './contexts/GameContext';
import MetadataProvider from './contexts/MetadataContext';
import Router from './routes';
import ThemeProvider from './theme';

// ----------------------------------------------------------------------

function App() {
  return (
    <ThemeProvider>
      <ThemeLocalization>
        <MetadataProvider>
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
        </MetadataProvider>
      </ThemeLocalization>
    </ThemeProvider>
  );
}

export default App;
