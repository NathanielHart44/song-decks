import { Typography } from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import { FactionAndCommanderSelect } from "./FactionAndCommanderSelect";
import useListBuildManager from "src/hooks/useListBuildManager";

// ----------------------------------------------------------------------
type BuilderTopDisplayProps = {
    isMobile: boolean;
    handleFactionClick: (arg0: Faction | null) => void;
    handleCommanderClick: (arg0: Commander | null) => void;
    testing?: boolean;
};
export function BuilderTopDisplay(
    {
        isMobile, handleFactionClick, handleCommanderClick, testing
    }: BuilderTopDisplayProps
) {

    const { listState } = useListBuildManager();

    const displaySelect = () => {
        if (listState.selectedFaction && listState.selectedCommander) {
            if (listState.selectedView === 'attachments') {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
        
    };

    return (
        <>
            {listState.selectedFaction ?
                <></> :
                <Typography variant={'h3'}>List Builder</Typography>
            }
            {displaySelect() &&
                <FactionAndCommanderSelect
                    isMobile={isMobile}
                    allFactions={listState.allFactions}
                    selectedFaction={listState.selectedFaction}
                    selectedCommander={listState.selectedCommander}
                    factionCommanders={listState.factionCommanders}
                    handleFactionClick={handleFactionClick}
                    handleCommanderClick={handleCommanderClick}
                />
            }
            {testing &&
                <Typography variant={'h4'}>{listState.selectedUnitTempID}</Typography>
            }
        </>
    );
}
;
