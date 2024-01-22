import { Box, Container, Dialog, Divider, Grid, Stack, SxProps, Theme, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Attachment, List, NCU, Unit } from "src/@types/types";
import { SelectableAvatar } from "../base/SelectableAvatar";
import { DEFAULT_FILTER_SORT } from "src/pages/ListBuilder";
import { sortItems } from "../list-build/ListAvailableSelections";
import { containsAttachments, getImgSizing, getItemTitle } from "../list-build/AvailableSelection";
import { FactionAndCommanderSelect } from "../list-build/FactionAndCommanderSelect";
import { calcTotalPoints, calcNeutralPoints } from "./ListDisplay";

// ----------------------------------------------------------------------

type ListOverviewProps = {
    isMobile: boolean;
    currentList: List;
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
};

export function ListOverview({ isMobile, currentList, dialogOpen, setDialogOpen }: ListOverviewProps) {

    const theme = useTheme();

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
            <ListOverviewDiv isMobile={isMobile} currentList={currentList} />
        </Dialog>
    );
};

// ----------------------------------------------------------------------

type ListOverviewDivProps = {
    isMobile: boolean;
    currentList: List;
};

export function ListOverviewDiv({ isMobile, currentList }: ListOverviewDivProps) {
    
    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'
    };

    return (
        <Container maxWidth={false} sx={{ width: '100%' }}>
            <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                <Box sx={{ height: 1, width: '100%' }} />
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
                            <GridItemContainer
                                key={index + '_unit_container'}
                                isMobile={isMobile}
                                index={index}
                                item={unit}
                                type={'unit'}
                            />
                        ))}
                    </Grid>
                </Box>

                <Divider sx={{ width: '65%' }} />

                <Typography variant={'h4'}>
                    NCUs
                </Typography>
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={gridContainerStyles}>
                        {(sortItems('ncu', currentList.ncus, DEFAULT_FILTER_SORT) as NCU[]).map((ncu: NCU, index) => (
                            <GridItemContainer
                                key={index + '_ncu_container'}
                                isMobile={isMobile}
                                index={index}
                                item={ncu}
                                type={'ncu'}
                            />
                        ))}
                    </Grid>
                </Box>

                <Divider sx={{ width: '65%' }} />

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
                        {(currentList.faction.neutral || !currentList.faction.can_use_neutral) ?
                            <Typography>-/-</Typography> :
                            <Typography>
                                {calcNeutralPoints(currentList)}/{currentList.points_allowed * 0.3}
                            </Typography>
                        }
                    </Stack>
                </Stack>
                <Box sx={{ pt: 2, width: '100%' }} />
            </Stack>
        </Container>
    )
};

// ----------------------------------------------------------------------

type GridItemContainerProps = {
    isMobile: boolean;
    index: number;
    item: Unit | Attachment | NCU;
    type: 'unit' | 'attachment' | 'ncu';
};

function GridItemContainer({ isMobile, index, item, type }: GridItemContainerProps) {

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const gridItemStyles: SxProps<Theme> = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
    };

    return (
        <Grid item key={index + '_' + type} sx={gridItemStyles}>
            <SelectableAvatar
                item={item}
                altText={getItemTitle(item, type, false)}
                isMobile={isMobile}
                handleClick={() => { setDialogOpen(true) }}
                attachments={type === 'unit' ? (item as Unit).attachments : []}
            />
            <CardView
                isMobile={isMobile}
                type={type}
                mainItem={item}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
            />
        </Grid>
    );
};

// ----------------------------------------------------------------------

type CardViewProps = {
    isMobile: boolean;
    type: 'unit' | 'attachment' | 'ncu';
    mainItem: Unit | Attachment | NCU | null;
    dialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
}

function CardView({ isMobile, type, mainItem, dialogOpen, setDialogOpen }: CardViewProps) {

    const theme = useTheme();
    const [viewedItem, setViewedItem] = useState<Unit | Attachment | NCU>();

    const contains_attachments: boolean = mainItem ? containsAttachments(type, mainItem) : false;

    useEffect(() => {
        if (mainItem) {
            setViewedItem(mainItem);
        }
    }, [mainItem]);

    return (
        <Dialog
            open={dialogOpen}
            scroll={"body"}
            fullScreen
            maxWidth={false}
            sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                color: theme.palette.primary.main,
                zIndex: (theme) => theme.zIndex.drawer + 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '.MuiDialog-paperFullScreen': { backgroundColor: 'transparent' },
                '.MuiDialog-container': { width: '100%' }
            }}
            onClick={(event) => {
                event.stopPropagation();
                setDialogOpen(false);
            }}
        >
            <Stack justifyContent={'center'} alignItems={'center'} sx={{ height: '100%', width: '100%' }}>
                <Stack
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        height: '100%',
                        width: '95%',
                        padding: isMobile ? 2 : 4,
                        zIndex: (theme) => theme.zIndex.drawer + 3
                    }}
                >
                    {mainItem && contains_attachments &&
                        <ToggleButtonGroup
                            color="primary"
                            value={viewedItem?.name}
                            exclusive
                            size={'small'}
                            fullWidth={!isMobile}
                            orientation={isMobile ? 'vertical' : 'horizontal'}
                            onClick={event => event.stopPropagation()}
                        >
                            <ToggleButton value={mainItem.name} onClick={() => { setViewedItem(mainItem); }}>
                                {mainItem.name} ({mainItem.points_cost})
                            </ToggleButton>
                            {type === 'unit' &&
                                (mainItem as Unit).attachments.map((attachment, attach_index) => (
                                    <ToggleButton
                                        key={attachment.name + '_toggle_' + attach_index}
                                        value={attachment.name ? attachment.name : attachment.name}
                                        onClick={() => { setViewedItem(attachment); }}
                                    >
                                        {attachment.name} ({attachment.attachment_type === 'commander' ? 'C' : attachment.points_cost})
                                    </ToggleButton>
                                ))
                            }
                        </ToggleButtonGroup>
                    }
                    {viewedItem &&
                        <Box sx={getImgSizing(isMobile)} onClick={event => event.stopPropagation()}>
                            <img
                                src={viewedItem.main_url}
                                alt={viewedItem.name + ' main image'}
                                loading="eager"
                                style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </Box>
                    }
                </Stack>
            </Stack>
        </Dialog>
    );
};