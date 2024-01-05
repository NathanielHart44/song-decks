/* eslint-disable react-hooks/exhaustive-deps */
import {
    Accordion,
    Box,
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    useTheme,
    AccordionDetails,
    Button,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Attachment, Commander, Faction, NCU, Unit } from "src/@types/types";
import SpeedDialDiv from "src/components/SpeedDialDiv";
import Iconify from "src/components/base/Iconify";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import AccordionSummaryDiv from "src/components/workbench/AccordionSummaryDiv";
import { MetadataContext } from "src/contexts/MetadataContext";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

type VIEW_OPTIONS = 'my_list' | 'units' | 'attachments' | 'ncus';
type ALL_CONTENT_OPTIONS = 'factions' | 'commanders' | VIEW_OPTIONS;

export default function ListBuilder() {

    const { apiCall } = useApiCall();
    const { isMobile } = useContext(MetadataContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);
    const [allFactions, setAllFactions] = useState<Faction[]>([]);
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);
    const [factionCommanders, setFactionCommanders] = useState<Commander[] | null>(null);
    const [factionUnits, setFactionUnits] = useState<Unit[] | null>(null);
    const [factionAttachments, setFactionAttachments] = useState<Attachment[] | null>(null);
    const [factionNCUs, setFactionNCUs] = useState<NCU[] | null>(null);

    const [selectedView, setSelectedView] = useState<VIEW_OPTIONS>('my_list');

    const getContent = async (type: ALL_CONTENT_OPTIONS) => {
        setAwaitingResponse(true);
        let url;
        if (type === 'factions') {
            url = `${type}`;
        } else {
            url = `${type}/${selectedFaction?.id}`;
        }
        apiCall(url, 'GET', null, (data) => {
            if (type === 'factions') {
                setAllFactions(data);
            } else if (type === 'commanders') {
                setFactionCommanders(data);
            } else if (type === 'units') {
                setFactionUnits(data);
            } else if (type === 'attachments') {
                setFactionAttachments(data);
            } else if (type === 'ncus') {
                setFactionNCUs(data);
            };
        });
        if (type === 'factions') { setAwaitingResponse(false) };
    };

    useEffect(() => { processTokens(() => { getContent('factions') }) }, []);
    useEffect(() => {
        if (selectedFaction) {
            setFactionCommanders(null);
            setFactionUnits(null);
            setFactionAttachments(null);
            setFactionNCUs(null);
            processTokens(() => {
                ['commanders', 'units', 'attachments', 'ncus'].forEach((type) => {
                    getContent(type as ALL_CONTENT_OPTIONS);
                });
            })
        }
    }, [selectedFaction]);

    useEffect(() => {
        if (selectedFaction && factionCommanders && factionUnits && factionAttachments && factionNCUs) {
            setAwaitingResponse(false);
        }
    }, [selectedFaction, factionCommanders, factionUnits, factionAttachments, factionNCUs]);

    const handleFactionClick = (faction: Faction | null) => {
        if (faction && faction.id === selectedFaction?.id) {
            setSelectedFaction(null);
            setSelectedCommander(null);
            setSelectedView('my_list');
        } else {
            setSelectedFaction(faction);
        }
    };

    const handleCommanderClick = (commander: Commander | null) => {
        if (commander && commander.id === selectedCommander?.id) {
            setSelectedCommander(null);
        } else {
            setSelectedCommander(commander);
        }
    };

    return (
        <>
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h3'}>List Builder</Typography>
                <FactionAndCommanderSelect
                    isMobile={isMobile}
                    allFactions={allFactions}
                    selectedFaction={selectedFaction}
                    selectedCommander={selectedCommander}
                    factionCommanders={factionCommanders}
                    handleFactionClick={handleFactionClick}
                    handleCommanderClick={handleCommanderClick}
                />
                <ListAvailableSelections
                    availableItems={
                        selectedFaction === null ? null :
                        selectedView === 'units' ? factionUnits :
                            selectedView === 'attachments' ? factionAttachments :
                                selectedView === 'ncus' ? factionNCUs :
                                    null
                    }
                />
            </Stack>
            <SelectView
                selectedFaction={selectedFaction}
                selectedView={selectedView}
                setSelectedView={setSelectedView}
            />
        </>
    );
};

// ----------------------------------------------------------------------

type AvailableSelectionProps = {
    item: Unit | Attachment | NCU;
};

function AvailableSelection({ item }: AvailableSelectionProps) {

    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);

    return (
        <Stack sx={{ width: '100%' }}>
            <Accordion
                disableGutters={true}
                expanded={accordionOpen}
                sx={{ ...(accordionOpen && { bgcolor: 'transparent' }) }}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummaryDiv
                    accordionOpen={accordionOpen}
                    setAccordionOpen={setAccordionOpen}
                    title={`${item.name} (${item.points_cost})`}
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    <Stack spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <Grid item xs={12} md={6}>
                                <Button variant={'contained'} fullWidth>Add to List</Button>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Button variant={'contained'} fullWidth>View Card</Button>
                            </Grid>
                        </Grid>
                        <SelectableAvatar
                            item={item}
                            altText={item.name}
                            isMobile={false}
                            handleClick={() => {}}
                        />
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );
};

// ----------------------------------------------------------------------

type ListAvailableSelectionsProps = {
    availableItems: Unit[] | Attachment[] | NCU[] | null;
};

function ListAvailableSelections({ availableItems }: ListAvailableSelectionsProps) {

    return (
        <>
            {availableItems &&
                <Box sx={{ width: '100%' }}>
                    <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        {availableItems.map((item) => (
                            <AvailableSelection key={item.name + '_select_' + item.id} item={item} />
                        ))}
                    </Stack>
                </Box>
            }
        </>
    );
};

// ----------------------------------------------------------------------

type SelectViewProps = {
    selectedFaction: Faction | null;
    selectedView: VIEW_OPTIONS;
    setSelectedView: (arg0: VIEW_OPTIONS) => void;
};

function SelectView({selectedFaction, selectedView, setSelectedView}: SelectViewProps) {

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
                            icon: <Iconify icon={'icon-park-solid:layers'} width={'55%'} height={'55%'} color={getDialColor('my_list' as VIEW_OPTIONS)}/>
                        },
                        {
                            name: 'Units',
                            source: 'units' as VIEW_OPTIONS,
                            icon: <Iconify icon={'mdi:square-rounded-outline'} width={'55%'} height={'55%'} color={getDialColor('units' as VIEW_OPTIONS)}/>
                        },
                        {
                            name: 'Attachments',
                            source: 'attachments' as VIEW_OPTIONS,
                            icon: <Iconify icon={'mdi:square-rounded-badge-outline'} width={'55%'} height={'55%'} color={getDialColor('attachments' as VIEW_OPTIONS)}/>
                        },
                        {
                            name: 'NCUs',
                            source: 'ncus' as VIEW_OPTIONS,
                            icon: <Iconify icon={'mdi:quill'} width={'55%'} height={'55%'} color={getDialColor('ncus' as VIEW_OPTIONS)}/>
                        },
                    ]}
                />
            }
        </>
    );
}

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

function FactionAndCommanderSelect(
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
    )
}