import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Menu, MenuItem, Divider, IconButton, Typography, ListItemIcon, useTheme, Stack, Button, Tooltip } from '@mui/material';
import { MetadataContext } from 'src/contexts/MetadataContext';
import { logout } from 'src/utils/jwt';
import { PATH_AUTH, PATH_PAGE } from 'src/routes/paths';
import { Profile } from 'src/@types/types';
import Iconify from '../base/Iconify';

// icons
import HomeIcon from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
// import HelpIcon from '@mui/icons-material/Help';
import ConstructionIcon from '@mui/icons-material/Construction';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ContactPop from '../ContactPop';

// ----------------------------------------------------------------------

export default function AccountMenu() {

    const { isMobile, currentUser } = useContext(MetadataContext);
    const is_moderator = currentUser?.moderator;
    const is_admin = currentUser?.admin;

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);

    const handleFeedback = () => { setFeedbackOpen(!feedbackOpen) };

    const handleClose = (type: string) => {
        switch (type) {
            case 'home':
                navigate(PATH_PAGE.home);
                break;
            case 'feedback':
                handleFeedback();
                break;
            case 'workbench':
                navigate(PATH_PAGE.workbench);
                break;
            case 'manage_content':
                navigate(PATH_PAGE.manage);
                break;
            case 'admin':
                navigate(PATH_PAGE.admin);
                break;
            case 'profile':
                navigate(PATH_PAGE.profile);
                break;
            case 'logout':
                logout();
                break;
            default:
                break;
        }
        setAnchorEl(null);
    };

    if (!currentUser) return (
        <Stack direction={'row'} spacing={1}>
            <Button
                color="inherit"
                onClick={() => { navigate(PATH_AUTH.register) }}
            >
                Sign Up
            </Button>
            <Button
                variant={'contained'}
                onClick={() => { navigate(PATH_AUTH.login) }}
            >
                Login
            </Button>
        </Stack>
    );

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            { isMobile ?
                <>
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Iconify
                            icon={'eva:menu-outline'}
                            color={theme.palette.text.primary}
                            width={30}
                            height={30}
                        />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={ ()=> handleClose('default') }
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                ml: isMobile ? 1.5 : 0,
                                bgcolor: theme.palette.background.paper,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 15,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={ ()=> handleClose('profile') }>
                            <ListItemIcon>
                                <AvatarDisplay is_main={false} currentUser={currentUser} />
                            </ListItemIcon>
                            {currentUser ? currentUser.user.username : '--'}
                        </MenuItem>
                        <Divider />
                        { is_admin &&
                            [
                                <MenuItem key={"admin"} onClick={ ()=> handleClose('admin') }>
                                    <ListItemIcon>
                                        <Iconify
                                            icon={'eos-icons:admin-outlined'}
                                            width={24}
                                            height={24}
                                        />
                                    </ListItemIcon>
                                    Admin Page
                                </MenuItem>,
                                <Divider key={"divider_1"} />
                            ]                        
                        }
                        { is_moderator &&
                            [
                                <MenuItem key={"manage_content"} onClick={ ()=> handleClose('manage_content') }>
                                    <ListItemIcon>
                                        <Settings fontSize="small" />
                                    </ListItemIcon>
                                    Manage Content
                                </MenuItem>,
                                <MenuItem key={"workbench"} onClick={ ()=> handleClose('workbench') }>
                                    <ListItemIcon>
                                        <ConstructionIcon fontSize="small" />
                                    </ListItemIcon>
                                    Workbench
                                </MenuItem>,
                                <Divider key={"divider_2"} />
                            ]
                        }
                        <MenuItem onClick={ ()=> handleClose('feedback')}>
                            <ListItemIcon>
                                <FeedbackIcon fontSize="small" />
                            </ListItemIcon>
                            Feedback & Bugs
                        </MenuItem>
                        <MenuItem onClick={ ()=> handleClose('home')}>
                            <ListItemIcon>
                                <HomeIcon fontSize="small" />
                            </ListItemIcon>
                            Home
                        </MenuItem>
                        <MenuItem onClick={ ()=> handleClose('logout') }>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </> :
                <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                    { is_admin &&
                        <>
                            <Tooltip title={"Admin Page"} placement={"bottom"} arrow>
                                <IconButton
                                    onClick={ () => handleClose('admin') }
                                    size="small"
                                >
                                    <Iconify
                                        icon={'eos-icons:admin-outlined'}
                                        width={24}
                                        height={24}
                                    />
                                </IconButton>
                            </Tooltip>
                            <Divider orientation="vertical" flexItem />
                        </>
                    }
                    { is_moderator &&
                        <>
                            <Tooltip title={"Workbench"} placement={"bottom"} arrow>
                                <IconButton
                                    onClick={ () => handleClose('workbench') }
                                    size="small"
                                >
                                    <ConstructionIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Manage Content"} placement={"bottom"} arrow>
                                <IconButton
                                    onClick={ () => handleClose('manage_content') }
                                    size="small"
                                >
                                    <Settings fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Divider orientation="vertical" flexItem />
                        </>
                    }
                    <Tooltip title={"Feedback & Bugs"} placement={"bottom"} arrow>
                        <IconButton
                            onClick={ () => handleClose('feedback') }
                            size="small"
                        >
                            <FeedbackIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Home"} placement={"bottom"} arrow>
                        <IconButton
                            onClick={ () => handleClose('home') }
                            size="small"
                        >
                            <HomeIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Logout"} placement={"bottom"} arrow>
                        <IconButton
                            onClick={ () => handleClose('logout') }
                            size="small"
                        >
                            <Logout fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem />
                    <Tooltip title={"Profile Settings"} placement={"bottom"} arrow>
                        <IconButton
                            onClick={ () => handleClose('profile') }
                            size="small"
                        >
                            <AvatarDisplay is_main={false} currentUser={currentUser} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            }
            <ContactPop
                popOpen={feedbackOpen}
                setPopOpen={setFeedbackOpen}
            />
        </Box>
    );
}

// ----------------------------------------------------------------------

type AvatarDisplayProps = {
    is_main: boolean;
    currentUser: Profile | undefined;
}

export function AvatarDisplay({ is_main, currentUser }: AvatarDisplayProps) {
    const theme = useTheme();
    const size = is_main ? 40 : 32;

    console.log(currentUser);

    return (
        <Avatar
            sx={{
                width: size,
                height: size,
                bgcolor: theme.palette.primary.main,
            }}
        >
            <Typography variant={is_main ? "h6" : "body1"} fontFamily={'Metamorphous'} sx={{ color: theme.palette.text.primary }}>
            {/* <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.palette.text.primary }}> */}
                {currentUser ? currentUser.user.first_name[0].toUpperCase() + currentUser.user.last_name[0].toUpperCase() : '--'}
            </Typography>
        </Avatar>
    )
}