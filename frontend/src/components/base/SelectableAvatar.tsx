import { Avatar, Badge, Box, Stack, SxProps, Theme, Typography } from "@mui/material";
import { capWordsLower } from "src/utils/capWords";
import { Attachment } from "src/@types/types";

// ----------------------------------------------------------------------
type SelectableAvatarProps = {
    altText: string;
    handleClick: (arg0: any) => void;
    item: any;
    isMobile: boolean;
    attachments?: Attachment[];
    defaultIcon?: string;
    sxOverrides?: SxProps<Theme>;
};
export function SelectableAvatar({ altText, handleClick, item, isMobile, attachments, defaultIcon, sxOverrides }: SelectableAvatarProps) {

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

    function getCaptiontext() {
        if (altText.includes('SELECTED')) {
            return '';
        } else if (altText.includes('DEFAULT')) {
            return capWordsLower(altText.replace('DEFAULT', ''));
        } else {
            return altText;
        }
    }

    return (
        <Box>
            <Stack spacing={1} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={(attachments && attachments.length > 0) &&
                        <Badge invisible={attachments.length <= 1} badgeContent={`+${attachments.length - 1}`} color="primary">
                            <Avatar
                                alt={altText}
                                src={attachments[0].img_url}
                                variant={'rounded'}
                                sx={{ cursor: 'pointer', width: avatar_size * 0.5, height: avatar_size * 0.5 }}
                                onClick={() => { handleClick(item); }}
                            />
                        </Badge>
                    }
                >
                    {item ? (
                        <Avatar
                            alt={altText}
                            src={item.img_url}
                            variant={'rounded'}
                            sx={avatarStyles}
                            onClick={() => { handleClick(item); }}
                        />
                    ) : (
                        <Avatar
                            alt={altText}
                            variant={'rounded'}
                            sx={avatarStyles}
                            onClick={() => { handleClick(item); }}
                        >
                            <img src={defaultIcon} alt={altText} loading="lazy" />
                        </Avatar>
                    )}
                </Badge>
                <Typography variant={'caption'} align={'center'}>
                    {getCaptiontext()}
                </Typography>
            </Stack>
        </Box>
    );
};
