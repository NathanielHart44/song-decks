import MainStyle from './components/MainStyle';
import NavBar from './components/nav/NavBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeLocalization from './components/ThemeLocalization';
import HotJar from './components/user-tracking/HotJar';
import Pendo from './components/user-tracking/Pendo';
import GameProvider from './contexts/GameContext';
import ListBuilderProvider from './contexts/ListBuilderContext';
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
        </MetadataProvider>
      </ThemeLocalization>
    </ThemeProvider>
  );
}

export default App;
