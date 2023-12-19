// icons
import { Icon, IconifyIcon } from '@iconify/react';
// @mui
import { Box, BoxProps, SxProps, Tooltip, alpha, useTheme } from '@mui/material';
import { capWords } from 'src/utils/capWords';
// ----------------------------------------------------------------------

interface Props extends BoxProps {
    icon: IconifyIcon | string;
    sx?: SxProps;
}

export default function Iconify({ icon, sx, ...other }: Props) {

    return (
        <Box
            component={Icon}
            icon={icon}
            sx={{ ...sx }}
            {...other}
        />
    );
}

// ----------------------------------------------------------------------

interface ColorProps extends Props {
    size: number;
    color: string;
    name: string;
}

export function IconifyColor({ size, color, name, icon, sx, ...other }: ColorProps) {

    const theme = useTheme();
    const bg_color = alpha(color, theme.palette.action.selectedOpacity);

    return (
        <Tooltip title={name} placement={"bottom"} arrow>
        <Box
            sx={{
                width: size * 1.1,
                height: size * 1.1,
                display: 'flex',
                borderRadius: '50%',
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: bg_color,
                transition: (theme) =>
                    theme.transitions.create('all', {
                        duration: theme.transitions.duration.shortest,
                    }),
                ...sx,
            }}
            {...other}
        >
            <Iconify icon={icon} color={color} width={size} height={size} />
        </Box>
        </Tooltip>
    );
};

// ----------------------------------------------------------------------

type StatusIconifyProps = {
    status: string;
    size: number;
    sx?: SxProps;
};

export function StatusIconify({ status, size, sx }: StatusIconifyProps) {

    const theme = useTheme();

    function getStatusIconInfo(type: 'icon' | 'color') {
        switch (status) {
            case 'confirmed':
            case 'finished':
                return type === 'icon' ? 'eva:checkmark-circle-outline' : theme.palette.success.main;
            case 'in_progress':
                return type === 'icon' ? 'eva:arrow-circle-right-outline' : theme.palette.primary.main;
            case 'assigned':
            case 'pending':
                return type === 'icon' ? 'eva:clock-outline' : theme.palette.warning.main;
            case 'not_started':
                return type === 'icon' ? 'eva:alert-circle-outline' : theme.palette.secondary.main;
            case 'rejected':
                return type === 'icon' ? 'eva:close-fill' : theme.palette.error.main;
            case 'closed':
                return type === 'icon' ? 'eva:minus-outline' : theme.palette.grey[500];
            case 'low_complexity':
                // return type === 'icon' ? 'line-md:chevron-up' : theme.palette.specialIcons.bronze;
                // return type === 'icon' ? 'line-md:chevron-up' : theme.palette.primary.main;
                return type === 'icon' ? 'line-md:chevron-up' : theme.palette.grey[500];
            case 'medium_complexity':
                // return type === 'icon' ? 'line-md:chevron-double-up': theme.palette.specialIcons.silver;
                // return type === 'icon' ? 'line-md:chevron-double-up' : theme.palette.primary.main;
                return type === 'icon' ? 'line-md:chevron-double-up' : theme.palette.grey[500];
            case 'high_complexity':
                // return type === 'icon' ? 'line-md:chevron-triple-up' : theme.palette.specialIcons.gold;
                // return type === 'icon' ? 'line-md:chevron-triple-up' : theme.palette.primary.main;
                return type === 'icon' ? 'line-md:chevron-triple-up' : theme.palette.grey[500];
            case 'low_priority':
                return type === 'icon' ? 'iconoir:priority-down' : theme.palette.primary.main;
            case 'medium_priority':
                return type === 'icon' ? 'iconoir:priority-medium' : theme.palette.grey[500];
            case 'high_priority':
                return type === 'icon' ? 'iconoir:priority-high' : theme.palette.error.main;
            case 'private':
                return type === 'icon' ? 'eva:lock-outline' : theme.palette.grey[500];
            case 'public':
                return type === 'icon' ? 'eva:globe-outline' : theme.palette.grey[500];
            default:
                return type === 'icon' ? 'eva:clock-outline' : theme.palette.warning.main;
        };
    };

    const displayed_status = capWords(status);

    return (
        <IconifyColor
            name={displayed_status}
            icon={getStatusIconInfo('icon')}
            color={getStatusIconInfo('color')}
            size={size}
            sx={sx}
        />
    );
}