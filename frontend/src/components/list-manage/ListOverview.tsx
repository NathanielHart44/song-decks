import { Box, Container, Dialog, Grid, Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { useContext } from "react";
import { List, NCU, Unit } from "src/@types/types";
import { SelectableAvatar } from "../base/SelectableAvatar";
import { DEFAULT_FILTER_SORT } from "src/pages/ListBuilder";
import { sortItems } from "../list-build/ListAvailableSelections";
import { getItemTitle } from "../list-build/AvailableSelection";
import { MetadataContext } from "src/contexts/MetadataContext";
import { FactionAndCommanderSelect } from "../list-build/FactionAndCommanderSelect";
import { calcTotalPoints, calcNeutralPoints } from "./ListDisplay";

// ----------------------------------------------------------------------

type ListOverviewProps = {
    currentList: List;
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
};

export function ListOverview({ currentList, dialogOpen, setDialogOpen }: ListOverviewProps) {

    const theme = useTheme();
    const { isMobile } = useContext(MetadataContext);

    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'
    };

    const gridItemStyles: SxProps<Theme> = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
    };

    return (
        <Dialog
            open={dialogOpen}
            scroll={"body"}
            fullScreen
            maxWidth={false}
            sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: theme.palette.primary.main,
                zIndex: (theme) => theme.zIndex.drawer + 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '.MuiDialog-paperFullScreen': { backgroundColor: 'transparent' },
                '.MuiDialog-container': { width: '100%' }
            }}
            onClick={() => setDialogOpen(false)}
        >
            <Container maxWidth={false} sx={{ width: '100%' }}>
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                    <Box sx={{ pt: 2, width: '100%' }} />
                    <Typography variant={'h5'} textAlign={'center'}>{currentList.name}</Typography>
                    <FactionAndCommanderSelect
                        isMobile={isMobile}
                        allFactions={[]}
                        selectedFaction={currentList.faction}
                        selectedCommander={currentList.commander}
                        factionCommanders={[]}
                        handleFactionClick={() => { }}
                        handleCommanderClick={() => { }}
                    />

                    <Typography variant={'h4'}>
                        Units
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={gridContainerStyles}>
                            {(sortItems('unit', currentList.units, DEFAULT_FILTER_SORT) as Unit[]).map((unit: Unit, index) => (
                                <Grid item key={index + '_unit'} sx={gridItemStyles}>
                                    <SelectableAvatar
                                        item={unit}
                                        altText={getItemTitle(unit, 'unit', false)}
                                        isMobile={false}
                                        handleClick={() => { }}
                                        attachments={unit.attachments}
                                        no_hover={true}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                    <Typography variant={'h4'}>
                        NCUs
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={gridContainerStyles}>
                            {(sortItems('ncu', currentList.ncus, DEFAULT_FILTER_SORT) as NCU[]).map((ncu: NCU, index) => (
                                <Grid item key={index + '_ncu'} sx={gridItemStyles}>
                                    <SelectableAvatar
                                        item={ncu}
                                        altText={getItemTitle(ncu, 'ncu', false)}
                                        isMobile={false}
                                        handleClick={() => { }}
                                        attachments={[]}
                                        no_hover={true}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'65%'}>
                        <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                            <Typography variant={'h4'} textAlign={'center'}>
                                Total Points
                            </Typography>
                            <Typography>{calcTotalPoints(currentList)}/{currentList.points_allowed}</Typography>
                        </Stack>
                        <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                            <Typography variant={'h4'} textAlign={'center'}>
                                Neutral Points
                            </Typography>
                            <Typography>{calcNeutralPoints(currentList)}/{currentList.points_allowed * 0.3}</Typography>
                        </Stack>
                    </Stack>
                    <Box sx={{ pt: 2, width: '100%' }} />
                </Stack>
            </Container>
        </Dialog>
    );
};
