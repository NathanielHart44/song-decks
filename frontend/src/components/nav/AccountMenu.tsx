import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Menu, MenuItem, Divider, IconButton, Typography, ListItemIcon, useTheme } from '@mui/material';
import { MetadataContext } from 'src/contexts/MetadataContext';
import { logout } from 'src/utils/jwt';
import { PATH_PAGE } from 'src/routes/paths';
import { User } from 'src/@types/types';
import Iconify from '../base/Iconify';

// icons
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import ConstructionIcon from '@mui/icons-material/Construction';

// ----------------------------------------------------------------------

export default function AccountMenu() {

    const { isMobile, currentUser } = useContext(MetadataContext);
    const is_moderator = currentUser?.moderator;

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (type: string) => {
        switch (type) {
            case 'home':
                navigate(PATH_PAGE.home);
                break;
            case 'workbench':
                navigate(PATH_PAGE.workbench);
                break;
            case 'manage_content':
                navigate(PATH_PAGE.manage);
                break;
            case 'moderator':
                navigate(PATH_PAGE.moderator)
                break;
            case 'profile':
                // navigate(`/profile/${currentUser?.id}`);
                break;
            case 'logout':
                logout();
                break;
            default:
                break;
        }
        setAnchorEl(null);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
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
                <MenuItem onClick={ ()=> handleClose('profile') } disabled>
                    <ListItemIcon>
                        <AvatarDisplay is_main={false} currentUser={currentUser} />
                    </ListItemIcon>
                    {currentUser ? currentUser.username : '--'}
                </MenuItem>
                <MenuItem onClick={ ()=> handleClose('home')} disabled>
                    <ListItemIcon>
                        <HelpIcon fontSize="small" />
                    </ListItemIcon>
                    How To Use
                </MenuItem>
                <Divider />
                { is_moderator &&
                    [
                        <MenuItem key={"moderator"} onClick={ ()=> handleClose('moderator') }>
                            <ListItemIcon>
                                <AdminPanelSettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Moderators
                        </MenuItem>,
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
                        <Divider key={"divider"} />
                    ]
                }
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
        </Box>
    );
}

// ----------------------------------------------------------------------

type AvatarDisplayProps = {
    is_main: boolean;
    currentUser: User | undefined;
}

export function AvatarDisplay({ is_main, currentUser }: AvatarDisplayProps) {
    const theme = useTheme();
    const size = is_main ? 40 : 32;

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
                {currentUser ? currentUser.first_name[0].toUpperCase() + currentUser.last_name[0].toUpperCase() : '--'}
            </Typography>
        </Avatar>
    )
}