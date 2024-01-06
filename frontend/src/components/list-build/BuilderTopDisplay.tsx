import { Stack, Typography, TextField, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import { FactionAndCommanderSelect } from "./FactionAndCommanderSelect";

// ----------------------------------------------------------------------
type BuilderTopDisplayProps = {
    isMobile: boolean;
    allFactions: Faction[];
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
    factionCommanders: Commander[] | null;
    handleFactionClick: (arg0: Faction | null) => void;
    handleCommanderClick: (arg0: Commander | null) => void;
    listTitle: string;
    handleTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    maxPoints: number;
    setMaxPoints: (arg0: number) => void;
};
export function BuilderTopDisplay(
    {
        isMobile, allFactions, selectedFaction, selectedCommander, factionCommanders, handleFactionClick, handleCommanderClick, listTitle, handleTitleChange, maxPoints, setMaxPoints
    }: BuilderTopDisplayProps
) {

    return (
        <>
            {selectedFaction ?
                <Stack width={isMobile ? '98%' : '65%'} justifyContent={'center'} alignItems={'center'}>
                    <Stack width={'100%'} direction={'row'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                        <TextField
                            label={'List Name'}
                            variant={'outlined'}
                            fullWidth
                            value={listTitle}
                            onChange={handleTitleChange}
                        />
                        <ToggleButtonGroup
                            color="primary"
                            value={maxPoints}
                            exclusive
                            // size={'small'}
                        >
                            <ToggleButton value={30} onClick={() => { setMaxPoints(30) }}>30</ToggleButton>
                            <ToggleButton value={40} onClick={() => { setMaxPoints(40) }}>40</ToggleButton>
                            <ToggleButton value={50} onClick={() => { setMaxPoints(50) }}>50</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Stack> :
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
        </>
    );
}
;
