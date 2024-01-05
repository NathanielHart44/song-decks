/* eslint-disable react-hooks/exhaustive-deps */
import {
    Accordion,
    Box,
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    AccordionDetails,
    Button,
    Divider,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Attachment, Commander, Faction, NCU, Unit } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import AccordionSummaryDiv from "src/components/workbench/AccordionSummaryDiv";
import { MetadataContext } from "src/contexts/MetadataContext";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import { SelectView } from "../components/list-build/SelectView";
import { BuilderTopDisplay } from "../components/list-build/BuilderTopDisplay";
import { genUniqueID } from "src/utils/genUniqueID";

// ----------------------------------------------------------------------

export const gridContainerStyles: SxProps<Theme> = {
    justifyContent: 'space-around',
    alignItems: 'center',
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'
};

export const gridItemStyles: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
};

// ----------------------------------------------------------------------

type ListClickProps = {
    type: 'unit' | 'ncu' | 'attachment';
    item: Unit | NCU | Attachment;
    in_list: boolean;
    index: number;
};
export type VIEW_OPTIONS = 'my_list' | 'units' | 'attachments' | 'ncus';
type ALL_CONTENT_OPTIONS = 'factions' | 'commanders' | VIEW_OPTIONS;
const DEFAULT_POINTS = 40;

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

    const [listTitle, setListTitle] = useState<string>('');
    const [usedPoints, setUsedPoints] = useState<number>(0);
    const [maxPoints, setMaxPoints] = useState<number>(DEFAULT_POINTS);

    const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
    const [selectedUnitTempID, setSelectedUnitTempID] = useState<string | null>(null);
    const [selectedNCUs, setSelectedNCUs] = useState<NCU[]>([]);

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
            setListTitle('');
            setUsedPoints(0);
            setMaxPoints(DEFAULT_POINTS);
            setSelectedNCUs([]);
            setSelectedUnits([]);
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

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setListTitle(event.target.value);
    };

    const handleMaxPointsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (isNaN(parseInt(value)) || parseInt(value) < 0) {
            setMaxPoints(0);
        } else if (parseInt(value) >= 999) {
            setMaxPoints(999);
        } else {
            setMaxPoints(parseInt(event.target.value));
        }
    };

    function getUnitTempID(unit: Unit, selected_units: Unit[]) {
        const unit_index = selected_units.findIndex((selected_unit) => selected_unit.id === unit.id);
        if (unit_index === -1) { return null };
        return selected_units[unit_index].temp_id;
    };

    const handleOpenAttachments = (unit: Unit) => {
        const temp_id = getUnitTempID(unit, selectedUnits);
        if (temp_id) {
            setSelectedUnitTempID(temp_id);
        }
        setSelectedView('attachments');
    };

    const handleListClick = (props: ListClickProps) => {
        const { type, item, in_list, index } = props;
        if (in_list) {
            if (type === 'unit') {
                let unitToRemoveIndex = selectedUnits.findIndex((unit) => unit.id === item.id);
                if (index !== undefined) { unitToRemoveIndex = index };
                    
                if (unitToRemoveIndex !== -1) {
                    const newSelectedUnits = [...selectedUnits];
                    newSelectedUnits[unitToRemoveIndex].attachments = [];
                    newSelectedUnits.splice(unitToRemoveIndex, 1);
                    setSelectedUnits(newSelectedUnits);
                }                
            } else if (type === 'ncu') {
                setSelectedNCUs(selectedNCUs.filter((ncu) => ncu.id !== item.id));
            } else {
                // handle Attachment removal
                const attachment_temp_id = (item as Attachment).temp_id;
                if (!attachment_temp_id) { return };
                const attachmentsUnit = selectedUnits.find((unit) => unit.attachments.find((attachment) => attachment.temp_id === attachment_temp_id));
                if (!attachmentsUnit) { return };
                const attachmentToRemoveIndex = attachmentsUnit.attachments.findIndex((attachment) => attachment.temp_id === attachment_temp_id);
                if (attachmentToRemoveIndex !== -1) {
                    const newAttachmentsUnit = JSON.parse(JSON.stringify(attachmentsUnit));
                    newAttachmentsUnit.attachments.splice(attachmentToRemoveIndex, 1);
                    let unitToRemoveIndex = selectedUnits.findIndex((unit) => unit.temp_id === attachmentsUnit.temp_id);
                    if (unitToRemoveIndex !== -1) {
                        const newSelectedUnits = [...selectedUnits];
                        newSelectedUnits.splice(unitToRemoveIndex, 1);
                        newSelectedUnits.push(newAttachmentsUnit);
                        setSelectedUnits(newSelectedUnits);
                    }
                }
            }
        } else {
            if (type === 'unit') {
                let newUnit = JSON.parse(JSON.stringify(item)) as Unit;
                newUnit.temp_id = genUniqueID();
                newUnit.attachments = [];
                
                setSelectedUnits([...selectedUnits, newUnit]);
            } else if (type === 'ncu') {
                if (!selectedNCUs.find((ncu) => ncu.id === item.id)) {
                    setSelectedNCUs([...selectedNCUs, item as NCU]);
                }
            } else {
                // handle Attachment add
                if (!selectedUnitTempID) { return };
                const selectedUnit = JSON.parse(JSON.stringify(selectedUnits.find((unit) => unit.temp_id === selectedUnitTempID)));
                if (!selectedUnit) { return };
                let newAttachment = JSON.parse(JSON.stringify(item)) as Attachment;
                newAttachment.temp_id = genUniqueID();
                let newSelectedUnit = {
                    ...selectedUnit,
                    attachments: [...selectedUnit.attachments, newAttachment]
                };

                let unitToRemoveIndex = selectedUnits.findIndex((unit) => unit.temp_id === selectedUnit.temp_id);
                if (unitToRemoveIndex !== -1) {
                    const newSelectedUnits = [...selectedUnits];
                    newSelectedUnits.splice(unitToRemoveIndex, 1);
                    newSelectedUnits.push(newSelectedUnit);
                    setSelectedUnits(newSelectedUnits);
                    setSelectedUnitTempID(null);
                    setSelectedView('my_list');
                }
            }
        }
    };

    useEffect(() => {
        let newUsedPoints = 0;
        selectedUnits.forEach((unit) => {
            newUsedPoints += unit.points_cost;
            unit.attachments.forEach((attachment) => { newUsedPoints += attachment.points_cost });
        });
        selectedNCUs.forEach((ncu) => { newUsedPoints += ncu.points_cost });
        setUsedPoints(newUsedPoints);
    }, [selectedUnits, selectedNCUs]);

    return (
        <>
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h3'}>List Builder</Typography>
                <BuilderTopDisplay
                    isMobile={isMobile}
                    allFactions={allFactions}
                    selectedFaction={selectedFaction}
                    selectedCommander={selectedCommander}
                    factionCommanders={factionCommanders}
                    handleFactionClick={handleFactionClick}
                    handleCommanderClick={handleCommanderClick}
                    listTitle={listTitle}
                    handleTitleChange={handleTitleChange}
                    usedPoints={usedPoints}
                    maxPoints={maxPoints}
                    handleMaxPointsChange={handleMaxPointsChange}
                />
                {selectedFaction && selectedView === 'my_list' &&
                    <Stack
                        spacing={3}
                        width={'100%'}
                        justifyContent={'center'}
                        alignItems={'center'}
                    >
                        <Typography variant={'h4'}>Units</Typography>
                        <ListAvailableSelections
                            type={'unit'}
                            availableItems={selectedUnits}
                            in_list={true}
                            handleListClick={handleListClick}
                            handleOpenAttachments={handleOpenAttachments}
                        />
                        <Divider sx={{ width: '65%' }} />
                        <Typography variant={'h4'}>NCUs</Typography>
                        <ListAvailableSelections
                            type={'ncu'}
                            availableItems={selectedNCUs}
                            in_list={true}
                            handleListClick={handleListClick}
                        />
                    </Stack>

                }
                {selectedFaction && selectedView !== 'my_list' &&
                    <ListAvailableSelections
                        type={
                            selectedView === 'units' ? 'unit' :
                                selectedView === 'attachments' ? 'attachment' :
                                    selectedView === 'ncus' ? 'ncu' :
                                        'unit'
                        }
                        availableItems={
                            selectedView === 'units' ? factionUnits :
                                selectedView === 'attachments' ? factionAttachments :
                                    selectedView === 'ncus' ? factionNCUs :
                                        null
                        }
                        in_list={false}
                        handleListClick={handleListClick}
                    />
                }
            </Stack>
            <SelectView
                selectedFaction={selectedFaction}
                selectedView={selectedView}
                setSelectedView={setSelectedView}
            />
            { awaitingResponse && <LoadingBackdrop /> }
        </>
    );
};

// ----------------------------------------------------------------------

type ListAvailableSelectionsProps = {
    type: 'unit' | 'ncu' | 'attachment';
    in_list: boolean;
    availableItems: Unit[] | Attachment[] | NCU[] | null;
    handleListClick: (props: ListClickProps) => void;
    handleOpenAttachments?: (unit: Unit) => void;
};

function ListAvailableSelections({ type, in_list, availableItems, handleListClick, handleOpenAttachments }: ListAvailableSelectionsProps) {

    return (
        <>
            {availableItems &&
                <Box sx={{ width: '100%' }}>
                    <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        {availableItems.map((item, index) => (
                            <AvailableSelection
                                key={item.name + '_select_' + index}
                                item={item}
                                type={type}
                                index={index}
                                in_list={in_list}
                                handleListClick={handleListClick}
                                handleOpenAttachments={handleOpenAttachments}
                            />
                        ))}
                    </Stack>
                </Box>
            }
        </>
    );
};

// ----------------------------------------------------------------------

type AvailableSelectionProps = {
    type: 'unit' | 'ncu' | 'attachment';
    index: number;
    item: Unit | Attachment | NCU;
    in_list: boolean;
    handleListClick: (props: ListClickProps) => void;
    handleOpenAttachments?: (unit: Unit) => void;
};

function AvailableSelection({ type, index, item, in_list, handleListClick, handleOpenAttachments }: AvailableSelectionProps) {

    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);
    let item_title = `${item.name} (${item.points_cost})`;
    if (type === 'unit' && (item as Unit).attachments.length > 0) {
        item_title += ' -- ' + (item as Unit).attachments.map((attachment) => `${attachment.name} (${attachment.points_cost})`).join(', ');
    }

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
                    title={item_title}
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    <Stack spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <Grid item xs={12} md={4}>
                                <Button
                                    variant={'contained'}
                                    fullWidth
                                    onClick={() => handleListClick({ type, item, in_list, index })}
                                >
                                    {in_list ? `Remove from ${type === 'attachment' ? 'Unit' : 'List'}` :
                                    `Add to ${type === 'attachment' ? 'Unit' : 'List'}`}
                                </Button>
                            </Grid>
                            {type === 'unit' && in_list && handleOpenAttachments &&
                                <Grid item xs={12} md={4}>
                                    <Button
                                        variant={'contained'}
                                        fullWidth
                                        onClick={() => handleOpenAttachments(item as Unit)}
                                    >
                                        Add Attachment
                                    </Button>
                                </Grid>
                            }
                        </Grid>
                        <SelectableAvatar
                            item={item}
                            altText={item.name}
                            isMobile={false}
                            handleClick={() => {}}
                            // view a pop up of the card?
                        />
                        {type === 'unit' && in_list && handleOpenAttachments && (item as Unit).attachments.length > 0 &&
                            <>
                                {((item as Unit).attachments).map((attachment, attach_index) => (
                                    <AvailableSelection
                                        key={attachment.name + '_attach_' + attach_index}
                                        item={attachment}
                                        type={'attachment'}
                                        index={attach_index}
                                        in_list={true}
                                        handleListClick={handleListClick}
                                    />
                                ))}
                            </>
                        }
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );
};