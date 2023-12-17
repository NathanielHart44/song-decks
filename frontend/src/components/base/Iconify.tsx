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
    return <Box component={Icon} icon={icon} sx={{ ...sx }} {...other} />;
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
        if (status === 'confirmed' || status === 'finished') {
            return type === 'icon' ? 'eva:checkmark-fill' : theme.palette.success.main;
        }
        if (status === 'in_progress') {
            return type === 'icon' ? 'eva:arrow-circle-right-outline' : theme.palette.primary.main;
        }
        if (status === 'assigned' || status === 'pending') {
            return type === 'icon' ? 'eva:clock-outline' : theme.palette.warning.main;
        }
        if (status === 'not_started') {
            return type === 'icon' ? 'eva:alert-circle-outline' : theme.palette.secondary.main;
        }
        if (status === 'rejected') {
            return type === 'icon' ? 'eva:close-fill' : theme.palette.error.main;
        }
        return type === 'icon' ? 'eva:clock-outline' : theme.palette.warning.main;
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