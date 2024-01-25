import {
    AppBar,
    Toolbar,
    useTheme
} from '@mui/material';
// components
import Logo from '../Logo';
import { NAVBAR } from 'src/config';
import AccountMenu from './AccountMenu';

// ----------------------------------------------------------------------

export default function NavBar() {

    const theme = useTheme();

    return (
        // <HideOnScroll>
            <AppBar
                sx={{
                    height: NAVBAR.BASE_HEIGHT,
                    backgroundColor: theme.palette.grey.default_canvas,
                }}
            >
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    <Logo />
                    <AccountMenu />
                </Toolbar>
            </AppBar>
        // </HideOnScroll>
    )
};

// ----------------------------------------------------------------------

// interface Props {
//     window?: () => Window;
//     children: React.ReactElement;
// }

// function HideOnScroll(props: Props) {
//     const { children, window } = props;
//     const trigger = useScrollTrigger({
//         target: window ? window() : undefined,
//     });

//     return (
//         <Slide appear={false} direction="down" in={!trigger}>
//             {children}
//         </Slide>
//     );
// }