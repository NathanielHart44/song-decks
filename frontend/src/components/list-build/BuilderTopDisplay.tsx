import { Stack, Typography, TextField } from "@mui/material";
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
    usedPoints: number;
    maxPoints: number;
    handleMaxPointsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export function BuilderTopDisplay(
    {
        isMobile, allFactions, selectedFaction, selectedCommander, factionCommanders, handleFactionClick, handleCommanderClick, listTitle, handleTitleChange, usedPoints, maxPoints, handleMaxPointsChange
    }: BuilderTopDisplayProps
) {
    return (
        <>
            {selectedFaction &&
                <Stack width={'65%'} justifyContent={'center'} alignItems={'center'}>
                    <TextField
                        label={'List Name'}
                        variant={'outlined'}
                        fullWidth
                        value={listTitle}
                        onChange={handleTitleChange} />
                </Stack>}
            <FactionAndCommanderSelect
                isMobile={isMobile}
                allFactions={allFactions}
                selectedFaction={selectedFaction}
                selectedCommander={selectedCommander}
                factionCommanders={factionCommanders}
                handleFactionClick={handleFactionClick}
                handleCommanderClick={handleCommanderClick} />
            {selectedFaction &&
                <Stack
                    spacing={3}
                    width={'100%'}
                    direction={'row'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{ pt: 1 }}
                >
                    <TextField
                        label={'Used Points'}
                        variant={'outlined'}
                        size={"small"}
                        value={usedPoints}
                        error={usedPoints > maxPoints}
                        inputMode={"numeric"}
                        onChange={() => { }}
                        sx={{ '& input': { textAlign: 'center', width: '9ch' } }} />
                    <Typography>/</Typography>
                    <TextField
                        label={'Max Points'}
                        variant={'outlined'}
                        size={"small"}
                        value={maxPoints}
                        inputMode={"numeric"}
                        onChange={handleMaxPointsChange}
                        sx={{ '& input': { textAlign: 'center', width: '9ch' } }} />
                </Stack>}
        </>
    );
}
;
