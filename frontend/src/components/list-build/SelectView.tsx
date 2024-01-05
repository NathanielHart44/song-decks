import { useTheme } from "@mui/material";
import { Faction } from "src/@types/types";
import SpeedDialDiv from "src/components/SpeedDialDiv";
import Iconify from "src/components/base/Iconify";
import { VIEW_OPTIONS } from "../../pages/ListBuilder";

// ----------------------------------------------------------------------
type SelectViewProps = {
    selectedFaction: Faction | null;
    selectedView: VIEW_OPTIONS;
    setSelectedView: (arg0: VIEW_OPTIONS) => void;
};
export function SelectView({ selectedFaction, selectedView, setSelectedView }: SelectViewProps) {

    const theme = useTheme();

    const getDialColor = (view: VIEW_OPTIONS) => {
        if (view === selectedView) {
            return theme.palette.primary.main;
        } else {
            return 'default';
        }
    };

    return (
        <>
            {selectedFaction &&
                <SpeedDialDiv
                    setOpenModal={setSelectedView}
                    options={[
                        {
                            name: 'My List',
                            source: 'my_list' as VIEW_OPTIONS,
                            icon: <Iconify icon={'icon-park-solid:layers'} width={'55%'} height={'55%'} color={getDialColor('my_list' as VIEW_OPTIONS)} />
                        },
                        {
                            name: 'Units',
                            source: 'units' as VIEW_OPTIONS,
                            icon: <Iconify icon={'game-icons:swords-emblem'} width={'55%'} height={'55%'} color={getDialColor('units' as VIEW_OPTIONS)} />
                        },
                        {
                            name: 'NCUs',
                            source: 'ncus' as VIEW_OPTIONS,
                            icon: <Iconify icon={'mdi:quill'} width={'55%'} height={'55%'} color={getDialColor('ncus' as VIEW_OPTIONS)} />
                        },
                    ]} />}
        </>
    );
}
;
