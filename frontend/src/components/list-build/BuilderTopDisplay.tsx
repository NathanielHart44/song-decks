import { Typography, Divider } from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import { FactionAndCommanderSelect } from "./FactionAndCommanderSelect";

// ----------------------------------------------------------------------
type BuilderTopDisplayProps = {
    isMobile: boolean;
    allFactions: Faction[];
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
    factionCommanders: Commander[] | null;
    selectedUnitTempID: string | null;
    handleFactionClick: (arg0: Faction | null) => void;
    handleCommanderClick: (arg0: Commander | null) => void;
    testing?: boolean;
};
export function BuilderTopDisplay(
    {
        isMobile, allFactions, selectedFaction, selectedCommander, factionCommanders, selectedUnitTempID, handleFactionClick, handleCommanderClick, testing
    }: BuilderTopDisplayProps
) {

    return (
        <>
            {selectedFaction ?
                <></> :
                <Typography variant={'h3'}>List Builder</Typography>
            }
            <FactionAndCommanderSelect
                isMobile={isMobile}
                allFactions={allFactions}
                selectedFaction={selectedFaction}
                selectedCommander={selectedCommander}
                factionCommanders={factionCommanders}
                handleFactionClick={handleFactionClick}
                handleCommanderClick={handleCommanderClick}
            />
            {selectedFaction && selectedCommander &&
                <Divider sx={{ width: '65%' }} />
            }
            {testing &&
                <Typography variant={'h4'}>{selectedUnitTempID}</Typography>
            }
        </>
    );
}
;
