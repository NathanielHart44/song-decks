import {
    AppBar,
    Toolbar,
    Button,
    // useScrollTrigger,
    // Slide,
    Menu,
    MenuItem,
    Fade,
    Stack,
    IconButton,
    useTheme
} from '@mui/material';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetadataContext } from 'src/contexts/MetadataContext';
import { PATH_AUTH, PATH_PAGE } from 'src/routes/paths';
// components
import Iconify from './Iconify';
import Logo from './Logo';
import { logout } from 'src/utils/jwt';
import { User } from 'src/@types/types';
import { NAVBAR } from 'src/config';

// ----------------------------------------------------------------------

export default function NavBar() {

    const { isMobile, currentUser } = useContext(MetadataContext);
    const theme = useTheme();
    const is_login = window.location.href.indexOf("login") > -1;
    const navigate = useNavigate();

    return (
        // <HideOnScroll>
            <AppBar sx={{
                height: NAVBAR.BASE_HEIGHT,
                backgroundColor: theme.palette.grey.default_canvas,
            }}>
                <Toolbar disableGutters={isMobile ? true : false} sx={{ justifyContent: 'space-between' }}>
                    <Logo />
                    { currentUser && !is_login &&
                        <>
                            { !isMobile && <MenuButtons currentUser={currentUser} /> }
                            { isMobile && <PositionedMenu currentUser={currentUser} /> }
                        </>
                    }
                    { !currentUser && !is_login &&
                        <Button color="inherit" onClick={() => { navigate(PATH_AUTH.login) }}>Login</Button>
                    }
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

// ----------------------------------------------------------------------

type MenuButtonsProps = {
    currentUser: User;
};

function MenuButtons({ currentUser }: MenuButtonsProps) {
    const is_moderator = currentUser.moderator;
    const navigate = useNavigate();
    return (
        <Stack direction={'row'} spacing={1}>
            { is_moderator && <Button color="inherit" onClick={() => { navigate(PATH_PAGE.moderator) }}>Admin</Button> }
            { is_moderator && <Button color="inherit" onClick={() => { navigate(PATH_PAGE.manage) }}>Manage</Button> }
            <Button color="inherit" onClick={() => { navigate(PATH_PAGE.home) }}>Home</Button>
            <Button color="inherit" onClick={() => { logout() }}>Logout</Button>
        </Stack>
    )
}

// ----------------------------------------------------------------------

function PositionedMenu({ currentUser }: MenuButtonsProps) {
    const is_moderator = currentUser.moderator;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget) };
    const handleClose = () => { setAnchorEl(null) };
    const navigate = useNavigate();

    return (
        <div>
            <IconButton
                size="large"
                id="menu-button"
                aria-controls={open ? 'main-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                color="inherit"
                onClick={handleClick}
                disableRipple
            >
                <Iconify icon={'eva:menu-outline'} color={'inherit'} />
            </IconButton>
            <Menu
                id="main-menu"
                aria-labelledby="menu-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                TransitionComponent={Fade}
            >
                { is_moderator && <MenuItem color="inherit" onClick={() => { navigate(PATH_PAGE.moderator); handleClose() }}>Admin</MenuItem> }
                { is_moderator && <MenuItem color="inherit" onClick={() => { navigate(PATH_PAGE.manage); handleClose() }}>Manage</MenuItem> }
                <MenuItem color="inherit" onClick={() => { navigate(PATH_PAGE.home); handleClose() }}>Home</MenuItem>
                <MenuItem color="inherit" onClick={() => { logout() }}>Logout</MenuItem>
            </Menu>
        </div>
    );
}