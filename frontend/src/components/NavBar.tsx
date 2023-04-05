import {
    AppBar,
    Toolbar,
    Button,
    useScrollTrigger,
    Slide,
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
import { PATH_PAGE } from 'src/routes/paths';
// components
import Iconify from './Iconify';
import Logo from './Logo';

// ----------------------------------------------------------------------

export default function NavBar() {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    
    return (
        // <HideOnScroll>
            <AppBar sx={{
                backgroundColor: theme.palette.grey.default_canvas,
            }}>
                <Toolbar disableGutters={isMobile ? true : false} sx={{ justifyContent: 'space-between' }}>
                    <Logo />
                    { !isMobile && <MenuButtons /> }
                    { isMobile && <PositionedMenu /> }
                </Toolbar>
            </AppBar>
        // </HideOnScroll>
    )
};

// ----------------------------------------------------------------------

interface Props {
    window?: () => Window;
    children: React.ReactElement;
}

function HideOnScroll(props: Props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

// ----------------------------------------------------------------------

function MenuButtons() {
    const navigate = useNavigate();
    return (
        <Stack direction={'row'} spacing={1}>
            <Button color="inherit" onClick={() => { navigate(PATH_PAGE.game) }}>Play</Button>
            <Button color="inherit" onClick={() => { navigate(PATH_PAGE.home) }}>Home</Button>
            <Button color="inherit">Login</Button>
        </Stack>
    )
}

// ----------------------------------------------------------------------

function PositionedMenu() {
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
                <MenuItem color="inherit" onClick={() => { navigate(PATH_PAGE.game); handleClose() }}>Play</MenuItem>
                <MenuItem color="inherit" onClick={() => { navigate(PATH_PAGE.home); handleClose() }}>Home</MenuItem>
                {/* <MenuItem color="inherit">Login</MenuItem> */}
            </Menu>
        </div>
    );
}