import { Badge, BottomNavigation, BottomNavigationAction, Paper, Stack, Typography, useTheme } from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import Iconify from "src/components/base/Iconify";
import useListBuildManager from "src/hooks/useListBuildManager";
import Settings from '@mui/icons-material/Settings';
import { VIEW_OPTIONS } from "src/contexts/ListBuilderContext";
import { useParams } from "react-router-dom";

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

    const { validSubmission } = useListBuildManager();
    const { lc } = useParams();
    const is_edit = (lc !== undefined && lc !== null);

    const theme = useTheme();
    const text_color = theme.palette.grey[500];
    const point_error_color = theme.palette.secondary.main;

    function getSettingsIcon() {
        const validation_info = validSubmission(is_edit ? 'edit' : 'create');
        if (!validation_info.valid) {
            return <Iconify icon={'eva:alert-triangle-outline'} width={'200%'} height={'200%'} color={theme.palette.secondary.main} />;
        } else {
            return <Iconify icon={'eva:checkmark-outline'} width={'200%'} height={'200%'} color={theme.palette.success.main} />;
        };
    }

    return (
        <>
            {selectedFaction && selectedCommander &&
                <Paper square sx={{ position: 'fixed', bottom: -2, left: 0, right: 0, width: '100%', zIndex: 999 }} elevation={10}>
                    <BottomNavigation
                        value={selectedView}
                        onChange={(event, newValue) => {
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
                                        <Typography variant={'subtitle1'} color={usedPoints > maxPoints ? point_error_color : text_color}>{usedPoints}</Typography>
                                        <Typography variant={'subtitle1'} color={text_color}>/</Typography>
                                        <Typography variant={'subtitle1'} color={text_color}>{maxPoints}</Typography>
                                    </Stack>
                                </Stack>
                            }
                        />
                        <BottomNavigationAction value={'my_list'} label={"My List"} icon={<Iconify icon={'icon-park-solid:layers'} width={'55%'} height={'55%'} />} />
                        <BottomNavigationAction value={'units'} label={"Units"} icon={<Iconify icon={'game-icons:swords-emblem'} width={'55%'} height={'55%'} />} />
                        <BottomNavigationAction value={'ncus'} label={"NCUs"} icon={<Iconify icon={'mdi:quill'} width={'55%'} height={'55%'} />} />
                        <BottomNavigationAction
                            value={'settings'}
                            label={"Settings"}
                            icon={
                                <Badge
                                    overlap="rectangular"
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    badgeContent={getSettingsIcon()}
                                    invisible={false}
                                >
                                    <Settings />
                                </Badge>
                            }
                        />
                    </BottomNavigation>
                </Paper>
            }
        </>
    );
}
;
