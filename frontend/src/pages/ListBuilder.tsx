/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    Divider,
    useTheme,
} from "@mui/material";
import { useContext, useEffect } from "react";
import { Attachment, NCU, Unit } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";
import { SelectView } from "../components/list-build/SelectView";
import { BuilderTopDisplay } from "../components/list-build/BuilderTopDisplay";
import { AvailableSelection } from "../components/list-build/AvailableSelection";
import useListBuildManager, { ALL_CONTENT_OPTIONS, VIEW_OPTIONS } from "src/hooks/useListBuildManager";

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

export type ListClickProps = {
    type: 'unit' | 'ncu' | 'attachment';
    item: Unit | NCU | Attachment;
    in_list: boolean;
    index: number;
};

// ----------------------------------------------------------------------

export default function ListBuilder() {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();

    const {
        listState,
        listDispatch,
        getContent,
        handleFactionClick,
        handleCommanderClick,
        handleListClick
    } = useListBuildManager();

    useEffect(() => { processTokens(() => { getContent('factions') }) }, []);
    useEffect(() => {
        if (listState.selectedFaction) {
            listDispatch({ type: 'SET_FACTION_COMMANDERS', payload: null });
            listDispatch({ type: 'SET_FACTION_UNITS', payload: null });
            listDispatch({ type: 'SET_FACTION_ATTACHMENTS', payload: null });
            listDispatch({ type: 'SET_AVAILABLE_ATTACHMENTS', payload: null });
            processTokens(() => {
                ['commanders', 'units', 'attachments', 'ncus'].forEach((type) => {
                    getContent(type as ALL_CONTENT_OPTIONS);
                });
            })
        }
    }, [listState.selectedFaction]);

    useEffect(() => {
        if (listState.selectedFaction && listState.factionCommanders && listState.factionUnits && listState.factionAttachments && listState.factionNCUs) {
            listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: false });
        }
    }, [listState.selectedFaction, listState.factionCommanders, listState.factionUnits, listState.factionAttachments, listState.factionNCUs]);

    useEffect(() => {
        if (!listState.selectedFaction || !listState.selectedCommander) { return };
        listDispatch({ type: 'SET_LIST_TITLE', payload: `${listState.selectedCommander.name} (${listState.selectedFaction.name})` });

        if (!listState.factionAttachments || !listState.availableAttachments) { return };
        let newAvailableAttachments = listState.availableAttachments.filter((attachment) => attachment.attachment_type !== 'commander');
        if (listState.selectedCommander.commander_type === 'attachment') {
            const commanderAttachment = listState.factionAttachments.find((attachment) => attachment.name === listState.selectedCommander!.name);
            if (commanderAttachment) {
                listDispatch({ type: 'SET_AVAILABLE_ATTACHMENTS', payload: [...newAvailableAttachments, commanderAttachment] });
            } else {
                listDispatch({ type: 'SET_AVAILABLE_ATTACHMENTS', payload: newAvailableAttachments });
            }
        }
    }, [listState.selectedFaction, listState.selectedCommander]);

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        listDispatch({ type: 'SET_LIST_TITLE', payload: event.target.value });
    };

    function getUnitTempID(unit: Unit, selected_units: Unit[]) {
        const unit_index = selected_units.findIndex((selected_unit) => selected_unit.id === unit.id);
        if (unit_index === -1) { return null };
        return selected_units[unit_index].temp_id;
    };

    const handleOpenAttachments = (unit: Unit) => {
        const temp_id = getUnitTempID(unit, listState.selectedUnits);
        if (temp_id) {
            listDispatch({ type: 'SET_SELECTED_UNIT_TEMP_ID', payload: temp_id });
        }
        listDispatch({ type: 'SET_SELECTED_VIEW', payload: 'attachments' });
    };

    useEffect(() => {
        let newUsedPoints = 0;
        listState.selectedUnits.forEach((unit) => {
            newUsedPoints += unit.points_cost;
            unit.attachments.forEach((attachment) => { newUsedPoints += attachment.points_cost });
        });
        listState.selectedNCUs.forEach((ncu) => { newUsedPoints += ncu.points_cost });
        listDispatch({ type: 'SET_USED_POINTS', payload: newUsedPoints });
    }, [listState.selectedUnits, listState.selectedNCUs]);

    function getDisabledItems(type: 'ncu' | 'attachment') {
        let disabled_items: Unit[] | NCU[] = [];
        if (type === 'ncu') {
            disabled_items = listState.selectedNCUs;
        } else if (type === 'attachment') {
            // attachments attached to selectedUnits whose field 'attachment_type' is 'commander' or 'character' should be disabled
            const selected_attachments = listState.selectedUnits.map((unit) => unit.attachments).flat();
            disabled_items = selected_attachments.filter((attachment) => attachment.attachment_type === 'commander' || attachment.attachment_type === 'character');
        }
        return disabled_items;
    };

    return (
        <>
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <BuilderTopDisplay
                    isMobile={isMobile}
                    handleFactionClick={handleFactionClick}
                    handleCommanderClick={handleCommanderClick}
                    handleTitleChange={handleTitleChange}
                    setMaxPoints={(points: number) => { listDispatch({ type: 'SET_MAX_POINTS', payload: points }) }}
                    {...listState}
                />
                <Stack
                    spacing={3}
                    width={'100%'}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    {listState.selectedFaction && listState.selectedCommander && listState.selectedView === 'my_list' &&
                        <>
                            <Typography variant={'h4'}>Units</Typography>
                            { listState.selectedUnits.length === 0 &&
                                <Typography color={theme.palette.text.disabled}>No Units Selected</Typography>
                            }
                            <ListAvailableSelections
                                type={'unit'}
                                availableItems={listState.selectedUnits}
                                disabledItems={[]}
                                in_list={true}
                                handleListClick={handleListClick}
                                handleOpenAttachments={handleOpenAttachments}
                            />
                            <Divider sx={{ width: '65%' }} />
                            <Typography variant={'h4'}>NCUs</Typography>
                            { listState.selectedNCUs.length === 0 &&
                                <Typography color={theme.palette.text.disabled}>No NCUs Selected</Typography>
                            }
                            <ListAvailableSelections
                                type={'ncu'}
                                availableItems={listState.selectedNCUs}
                                disabledItems={[]}
                                in_list={true}
                                handleListClick={handleListClick}
                            />
                        </>

                    }
                    {listState.selectedFaction && listState.selectedCommander && listState.selectedView !== 'my_list' &&
                        <>
                            <Typography variant={'h4'}>
                                {listState.selectedView === 'units' ? 'Units' : listState.selectedView === 'attachments' ? 'Attachments' : 'NCUs'}
                            </Typography>
                            <ListAvailableSelections
                                type={
                                    listState.selectedView === 'units' ? 'unit' :
                                        listState.selectedView === 'attachments' ? 'attachment' :
                                            listState.selectedView === 'ncus' ? 'ncu' :
                                                'unit'
                                }
                                availableItems={
                                    listState.selectedView === 'units' ? listState.factionUnits :
                                        listState.selectedView === 'attachments' ? listState.availableAttachments :
                                            listState.selectedView === 'ncus' ? listState.factionNCUs :
                                                null
                                }
                                disabledItems={
                                    listState.selectedView === 'attachments' ? getDisabledItems('attachment') :
                                        listState.selectedView === 'ncus' ? getDisabledItems('ncu') :
                                            null
                                }
                                in_list={false}
                                handleListClick={handleListClick}
                                handleOpenAttachments={handleOpenAttachments}
                            />
                        </>
                    }
                </Stack>
            </Stack>
            <SelectView
                setSelectedView={(view: VIEW_OPTIONS) => { listDispatch({ type: 'SET_SELECTED_VIEW', payload: view }) }}
                {...listState}
            />
            { listState.awaitingResponse && <LoadingBackdrop /> }
        </>
    );
};

// ----------------------------------------------------------------------

type ListAvailableSelectionsProps = {
    type: 'unit' | 'ncu' | 'attachment';
    in_list: boolean;
    availableItems: Unit[] | Attachment[] | NCU[] | null;
    disabledItems: Unit[] | NCU[] | null;
    handleListClick: (props: ListClickProps) => void;
    handleOpenAttachments?: (unit: Unit) => void;
};

function ListAvailableSelections({ type, in_list, availableItems, disabledItems, handleListClick, handleOpenAttachments }: ListAvailableSelectionsProps) {

    return (
        <>
            {availableItems &&
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={gridContainerStyles}>
                        {availableItems.map((item, index) => (
                            <AvailableSelection
                                key={item.name + '_select_' + index}
                                item={item}
                                type={type}
                                index={index}
                                in_list={in_list}
                                disabledItems={disabledItems}
                                handleListClick={handleListClick}
                                handleOpenAttachments={handleOpenAttachments}
                                gridItemStyles={gridItemStyles}
                            />
                        ))}
                    </Grid>
                </Box>
            }
        </>
    );
};