import { Badge, BottomNavigation, BottomNavigationAction, Paper, Stack, Typography, keyframes, useTheme } from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import Iconify from "src/components/base/Iconify";
import useListBuildManager from "src/hooks/useListBuildManager";
import SaveIcon from '@mui/icons-material/Save';
import { VIEW_OPTIONS } from "src/contexts/ListBuilderContext";
import { useParams } from "react-router-dom";
import { useContext, useState } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------
type SelectViewProps = {
    usedPoints: number;
    maxPoints: number;
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
    selectedView: VIEW_OPTIONS;
    setSelectedView: (arg0: VIEW_OPTIONS) => void;
};
export function SelectView({ usedPoints, maxPoints, selectedFaction, selectedCommander, selectedView, setSelectedView }: SelectViewProps) {

    const { isMobile } = useContext(MetadataContext);
    const { validSubmission } = useListBuildManager();
    const { lc } = useParams();
    const is_edit = (lc !== undefined && lc !== null);

    let icon_sizing = 'normal';
    if (isMobile) {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (vw < 380) {
            icon_sizing = 'small';
        };
    };

    const theme = useTheme();
    const text_color = theme.palette.grey[500];
    const point_error_color = theme.palette.secondary.main;

    const used_list_builder = localStorage.getItem('usedListBuilder') ?? 'false';
    const [shouldFlash, setShouldFlash] = useState<boolean>(used_list_builder === 'false');

    function getSettingsIcon() {
        const validation_info = validSubmission(is_edit ? 'edit' : 'create');
        if (!validation_info.valid) {
            return <Iconify icon={'eva:alert-triangle-outline'} width={'200%'} height={'200%'} color={theme.palette.secondary.main} />;
        } else {
            return <Iconify icon={'eva:checkmark-outline'} width={'200%'} height={'200%'} color={theme.palette.success.main} />;
        };
    };

    function getPulse() {
        return keyframes({
            '0%': {
                transform: isMobile ? 'scale(0.9)' : 'scale(0.95)',
                opacity: 1,
            },
            '50%': {
                transform: isMobile ? 'scale(1.1)' : 'scale(1.05)',
                opacity: 0.65,
                color: theme.palette.secondary.main,
            },
            '100%': {
                transform: isMobile ? 'scale(0.9)' : 'scale(0.95)',
                opacity: 1,
            },
        });
    };

    const middleItems = [
        {
            value: 'my_list',
            label: 'My List',
            icon: 'icon-park-solid:layers',
        },
        {
            value: 'units',
            label: 'Units',
            icon: 'game-icons:swords-emblem',
        },
        {
            value: 'ncus',
            label: 'NCUs',
            icon: 'mdi:quill',
        },
    ];

    return (
        <>
            {selectedFaction && selectedCommander &&
                <Paper
                    square
                    sx={{
                        position: 'fixed',
                        bottom: -2,
                        left: 0,
                        right: 0,
                        width: '100%',
                        zIndex: 999,
                        height: isMobile ? 72 : 60,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    elevation={10}
                >
                    <BottomNavigation
                        showLabels={!isMobile}
                        value={selectedView}
                        onChange={(event, newValue) => {
                            if (newValue !== 'save') { setShouldFlash(false) };
                            setSelectedView(newValue);
                        }}
                    >
                        <BottomNavigationAction
                            disabled
                            showLabel
                            label={"Points"}
                            icon={
                                <Stack justifyContent={'center'} alignItems={'center'}>
                                    <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} spacing={0.5}>
                                        <Typography variant={icon_sizing === 'small' ? 'subtitle2' : 'subtitle1'} color={usedPoints > maxPoints ? point_error_color : text_color}>{usedPoints}</Typography>
                                        <Typography variant={icon_sizing === 'small' ? 'subtitle2' : 'subtitle1'} color={text_color}>/</Typography>
                                        <Typography variant={icon_sizing === 'small' ? 'subtitle2' : 'subtitle1'} color={text_color}>{maxPoints}</Typography>
                                    </Stack>
                                </Stack>
                            }
                            sx={{ minWidth: "60px" }}
                        />
                        {middleItems.map(item => (
                            <BottomNavigationAction
                                key={item.value}
                                value={item.value}
                                label={item.label}
                                icon={
                                    <Iconify icon={item.icon} width={'55%'} height={'55%'} />
                                }
                                sx={{
                                    minWidth: "60px",
                                    ...(shouldFlash && { animation: `${getPulse()} 1s ease-in-out infinite` }),
                                    whiteSpace: 'nowrap',
                                }}
                            />
                        ))}
                        <BottomNavigationAction
                            value={'save'}
                            label={"Save"}
                            icon={
                                <Badge
                                    overlap="rectangular"
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    badgeContent={getSettingsIcon()}
                                    invisible={false}
                                >
                                    <SaveIcon />
                                </Badge>
                            }
                            sx={{ minWidth: "60px" }}
                        />
                    </BottomNavigation>
                </Paper>
            }
        </>
    );
};
