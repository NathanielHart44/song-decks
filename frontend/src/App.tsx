import './App.css';
import MainStyle from './components/MainStyle';
import NavBar from './components/NavBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeLocalization from './components/ThemeLocalization';
import MetadataProvider from './contexts/MetadataContext';
import Router from './routes';
import ThemeProvider from './theme';

// ----------------------------------------------------------------------

function App() {
  return (
    <ThemeProvider>
      <ThemeLocalization>
        <MetadataProvider>
          <NotistackProvider>
            <NavBar />
            <MainStyle>
              <Router />
            </MainStyle>
          </NotistackProvider>
        </MetadataProvider>
      </ThemeLocalization>
    </ThemeProvider>
  );
}

export default App;
