import { Avatar, Badge, Box, Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { capWordsLower } from "src/utils/capWords";
import { Attachment } from "src/@types/types";
import Iconify from "./Iconify";

// ----------------------------------------------------------------------
type SelectableAvatarProps = {
    altText: string;
    handleClick: (arg0: any) => void;
    item: any;
    isMobile: boolean;
    attachments?: Attachment[];
    defaultIcon?: string;
    disabled?: boolean;
    sxOverrides?: SxProps<Theme>;
};
export function SelectableAvatar({ altText, handleClick, item, isMobile, attachments, defaultIcon, disabled, sxOverrides }: SelectableAvatarProps) {

    const theme = useTheme();
    const avatar_size = isMobile ? 100 : 80;
    const is_iconify = defaultIcon && defaultIcon.includes(':');

    const avatarStyles = {
        width: avatar_size,
        height: avatar_size,
        ...(!isMobile && !disabled) ? {
            transition: 'transform 0.3s',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.1)' },
        } : {},
        ...(disabled) ? {
            opacity: 0.5,
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
    };

    return (
        <Box onClick={event => event.stopPropagation()}>
            <Stack spacing={1} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={(attachments && attachments.length > 0) &&
                        <Badge
                            invisible={attachments.length <= 1}
                            badgeContent={`+${attachments.length - 1}`}
                            color="primary"
                        >
                            <Avatar
                                alt={altText}
                                src={attachments[0].img_url}
                                variant={'rounded'}
                                sx={{
                                    cursor: 'pointer',
                                    width: avatar_size * 0.5,
                                    height: avatar_size * 0.5,
                                    border: `2px solid ${theme.palette.primary.main}`
                                }}
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
                            {is_iconify ?
                                <Iconify
                                    icon={defaultIcon}
                                    fontSize={avatar_size * 0.5}
                                    color={disabled ? 'default' : theme.palette.primary.darker}
                                /> :
                                <img src={defaultIcon} alt={altText} loading="eager" />
                            }
                        </Avatar>
                    )}
                </Badge>
                <Typography
                    variant={'caption'}
                    align={'center'}
                    color={disabled ? 'text.disabled' : 'text.primary'}
                >
                    {getCaptiontext()}
                </Typography>
                {/* {attachments && attachments.length === 1 &&
                    <>
                        <Divider sx={{ width: '100%' }} />
                        <Typography
                            variant={'caption'}
                            align={'center'}
                            color={disabled ? 'text.disabled' : 'text.primary'}
                        >
                            {`${attachments[0].name} (${attachments[0].attachment_type === 'commander' ? 'C' : attachments[0].points_cost})`}
                        </Typography>
                    </>
                }
                {attachments && attachments.length > 1 &&
                    <>
                        <Divider sx={{ width: '100%' }} />
                        <Typography
                            variant={'caption'}
                            align={'center'}
                            color={disabled ? 'text.disabled' : 'text.primary'}
                        >
                            {`${attachments.length} Attachments`}
                        </Typography>
                    </>
                } */}
            </Stack>
        </Box>
    );
};
