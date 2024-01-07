import { BottomNavigation, BottomNavigationAction, Paper, Stack, Typography, useTheme } from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import Iconify from "src/components/base/Iconify";
import { VIEW_OPTIONS } from "src/hooks/useListBuildManager";

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

    const theme = useTheme();
    const text_color = theme.palette.grey[500];

    return (
        <>
            {selectedFaction && selectedCommander &&
                <Paper square sx={{ position: 'fixed', bottom: -2, left: 0, right: 0, width: '100%', zIndex: 999 }} elevation={10}>
                    <BottomNavigation
                        showLabels
                        value={selectedView}
                        onChange={(event, newValue) => {
                            setSelectedView(newValue);
                        }}
                    >
                        <BottomNavigationAction
                            disabled
                            label="Points"
                            icon={
                                <Stack justifyContent={'center'} alignItems={'center'}>
                                    <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} spacing={0.5}>
                                        <Typography variant={'subtitle1'} color={text_color}>{usedPoints}</Typography>
                                        <Typography variant={'subtitle1'} color={text_color}>/</Typography>
                                        <Typography variant={'subtitle1'} color={text_color}>{maxPoints}</Typography>
                                    </Stack>
                                </Stack>
                            }
                        />
                        <BottomNavigationAction value={'my_list'} label="My List" icon={<Iconify icon={'icon-park-solid:layers'} width={'55%'} height={'55%'} />} />
                        <BottomNavigationAction value={'units'} label="Units" icon={<Iconify icon={'game-icons:swords-emblem'} width={'55%'} height={'55%'} />} />
                        <BottomNavigationAction value={'ncus'} label="NCUs" icon={<Iconify icon={'mdi:quill'} width={'55%'} height={'55%'} />} />
                    </BottomNavigation>
                </Paper>
            }
        </>
    );
}
;
