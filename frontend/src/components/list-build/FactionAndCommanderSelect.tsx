import {
    Box,
    Divider,
    Grid,
    Stack,
    useTheme
} from "@mui/material";
import { Commander, Faction } from "src/@types/types";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import { gridContainerStyles, gridItemStyles } from "../../pages/ListBuilder";

// ----------------------------------------------------------------------
type FactionAndCommanderSelectProps = {
    isMobile: boolean;
    allFactions: Faction[];
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
    factionCommanders: Commander[] | null;
    handleFactionClick: (arg0: Faction | null) => void;
    handleCommanderClick: (arg0: Commander | null) => void;
};
export function FactionAndCommanderSelect(
    { isMobile, allFactions, selectedFaction, selectedCommander, factionCommanders, handleFactionClick, handleCommanderClick }: FactionAndCommanderSelectProps
) {

    const theme = useTheme();

    return (
        <>
            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'flex-start'}>
                <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    {selectedFaction ?
                        <SelectableAvatar
                            item={selectedFaction}
                            altText={selectedFaction.name}
                            isMobile={isMobile}
                            handleClick={handleFactionClick}
                        /> :
                        <SelectableAvatar
                            item={selectedFaction}
                            altText={'Faction'}
                            defaultIcon={'/icons/throne.png'}
                            isMobile={isMobile}
                            handleClick={handleFactionClick}
                            sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas }}
                        />
                    }
                </Stack>
                <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    {selectedCommander ?
                        <SelectableAvatar
                            item={selectedCommander}
                            altText={selectedCommander.name}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick}
                        /> :
                        <SelectableAvatar
                            item={selectedCommander}
                            altText={'Commander'}
                            defaultIcon={'/icons/crown.svg'}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick}
                            sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                        />
                    }
                </Stack>
            </Stack>

            <Divider sx={{ width: '65%' }} />

            {!selectedFaction &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {allFactions.map((faction) => (
                            <Grid item key={faction.id + 'faction'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={faction}
                                    altText={faction.name}
                                    isMobile={isMobile}
                                    handleClick={handleFactionClick}
                                />
                            </Grid>
                        )
                        )}
                    </Grid>
                </Box>
            }
            {selectedFaction && !selectedCommander &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {factionCommanders?.map((commander) => (
                            <Grid item key={commander.id + 'commander'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={commander}
                                    altText={commander.name}
                                    isMobile={isMobile}
                                    handleClick={handleCommanderClick}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            }
        </>
    );
}
