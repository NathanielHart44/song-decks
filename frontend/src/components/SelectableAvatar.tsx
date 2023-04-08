import { Avatar, Box, Stack, SxProps, Theme, Typography } from "@mui/material";

// ----------------------------------------------------------------------
type SelectableAvatarProps = {
    altText: string;
    handleClick: (arg0: any) => void;
    item: any;
    isMobile: boolean;
    defaultIcon?: string;
    sxOverrides?: SxProps<Theme>;
};
export function SelectableAvatar({ altText, handleClick, item, isMobile, defaultIcon, sxOverrides }: SelectableAvatarProps) {

    const avatar_size = isMobile ? 100 : 80;

    const avatarStyles = {
        width: avatar_size,
        height: avatar_size,
        ...!isMobile ? {
            transition: 'transform 0.3s',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.1)' },
        } : {},
        ...sxOverrides,
    };

    return (
        <Box>
            <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                {item ? (
                    <Avatar
                        alt={altText}
                        src={item.img_url}
                        variant={'rounded'}
                        sx={avatarStyles}
                        onClick={() => { handleClick(item); }} />
                ) : (
                    <Avatar
                        alt={altText}
                        variant={'rounded'}
                        sx={avatarStyles}
                        onClick={() => { handleClick(item); }}
                    >
                        <img src={defaultIcon} alt={altText} />
                    </Avatar>
                )}
                <Typography variant={'caption'}>
                    {(item && !altText.includes('SELECTED')) ? item.name : ''}
                </Typography>
            </Stack>
        </Box>
    );
}
;
