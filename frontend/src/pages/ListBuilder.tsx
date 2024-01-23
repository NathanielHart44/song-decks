/* eslint-disable react-hooks/exhaustive-deps */
import {
    Stack,
    SxProps,
    Theme,
    Typography,
    Divider,
    useTheme,
    Container,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Attachment, NCU, Unit } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";
import { SelectView } from "../components/list-build/SelectView";
import { BuilderTopDisplay } from "../components/list-build/BuilderTopDisplay";
import useListBuildManager from "src/hooks/useListBuildManager";
import { ALL_CONTENT_OPTIONS, VIEW_OPTIONS } from "src/contexts/ListBuilderContext";
import { ListAvailableSelections } from "../components/list-build/ListAvailableSelections";
import Page from "src/components/base/Page";
import { useParams } from "react-router-dom";
import { SavePage } from "../components/list-build/SavePage";

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

export type FilterSortType = {
    pointsSort: 'asc' | 'desc';
    pointsFilter: number[];
    searchTerm: string;
    factionFilter: 'faction' | 'neutral' | 'all';
    unitTypeFilter: string[];
};

export const DEFAULT_FILTER_SORT: FilterSortType = {
    pointsSort: 'desc',
    pointsFilter: [0, 10],
    searchTerm: '',
    factionFilter: 'all',
    unitTypeFilter: ['infantry', 'cavalry', 'monster', 'war_machine'],
};

// ----------------------------------------------------------------------

export default function ListBuilder() {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const TESTING = false;
    const { lc } = useParams();

    const {
        listState,
        listDispatch,
        getContent,
        handleFactionClick,
        handleCommanderClick,
        handleListClick,
    } = useListBuildManager();

    const [filterSort, setFilterSort] = useState<FilterSortType>(DEFAULT_FILTER_SORT);

    useEffect(() => {
        if (lc) { listDispatch({ type: 'LOAD_LIST', payload: lc }) }
    }, [lc]);

    useEffect(() => {
        setFilterSort((prev) => ({
            ...prev,
            pointsFilter: DEFAULT_FILTER_SORT.pointsFilter,
            searchTerm: DEFAULT_FILTER_SORT.searchTerm,
            factionFilter: DEFAULT_FILTER_SORT.factionFilter,
            unitTypeFilter: DEFAULT_FILTER_SORT.unitTypeFilter,
        }));
    }, [listState.selectedView, listState.selectedFaction]);

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
        // We are tracking factionAttachments so that we can filter out commander attachments when editing a list.
    }, [listState.selectedFaction, listState.selectedCommander, listState.factionAttachments]);

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

    function getDisabledItems(type: 'ncu' | 'attachment' | 'unit') {
        let disabled_items: Unit[] | NCU[] = [];
        if (type === 'ncu') {
            disabled_items = listState.selectedNCUs;
        } else if (type === 'attachment') {
            const selected_attachments = listState.selectedUnits.map((unit) => unit.attachments).flat();
            disabled_items = selected_attachments.filter((attachment) => attachment.attachment_type === 'commander' || attachment.attachment_type === 'character');
        } else if (type === 'unit') {
            const selected_units = listState.selectedUnits;

            const new_disabled_items = listState.factionUnits?.filter((unit) => {
                const max_in_list = unit.max_in_list;

                if (max_in_list) {
                    const num_in_list = selected_units.filter((selected_unit) => selected_unit.name === unit.name).length;
                    if (num_in_list >= max_in_list) { return true };
                };
                return false;
            });

            if (new_disabled_items) { disabled_items = new_disabled_items };
        };
        return disabled_items;
    };

    return (
        <Page title="List Builder">
            <Container
                maxWidth={false}
                sx={{
                    ...(isMobile && { mb: 6 }),
                }}
            >
                <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <BuilderTopDisplay
                        testing={TESTING}
                        isMobile={isMobile}
                        handleFactionClick={handleFactionClick}
                        handleCommanderClick={handleCommanderClick}
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
                                <Typography variant={'h4'}>Selected Units</Typography>
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
                                    testing={TESTING}
                                    filterSort={filterSort}
                                    setFilterSort={setFilterSort}
                                />
                                <Divider sx={{ width: '65%' }} />
                                <Typography variant={'h4'}>Selected NCUs</Typography>
                                { listState.selectedNCUs.length === 0 &&
                                    <Typography color={theme.palette.text.disabled}>No NCUs Selected</Typography>
                                }
                                <ListAvailableSelections
                                    type={'ncu'}
                                    availableItems={listState.selectedNCUs}
                                    disabledItems={[]}
                                    in_list={true}
                                    handleListClick={handleListClick}
                                    testing={TESTING}
                                    filterSort={filterSort}
                                    setFilterSort={setFilterSort}
                                />
                            </>

                        }
                        {listState.selectedFaction && listState.selectedCommander && listState.selectedView !== 'my_list' && listState.selectedView !== 'save' &&
                            <>
                                {listState.selectedView === 'attachments' &&
                                    <>
                                        <Typography variant={'h4'}>
                                            Selected Unit
                                        </Typography>
                                        <ListAvailableSelections
                                            type={"unit"}
                                            availableItems={listState.selectedUnits.filter((unit) => unit.temp_id === listState.selectedUnitTempID)}
                                            disabledItems={[]}
                                            in_list={true}
                                            handleListClick={
                                                () => {
                                                    listDispatch({ type: 'SET_SELECTED_UNIT_TEMP_ID', payload: null });
                                                    listDispatch({ type: 'SET_SELECTED_VIEW', payload: 'my_list' });
                                                }
                                            }
                                            attachment_select={true}
                                            testing={TESTING}
                                            filterSort={filterSort}
                                            setFilterSort={setFilterSort}
                                        />
                                        <Divider sx={{ width: '65%' }} />
                                    </>
                                }
                                <Typography variant={'h4'}>
                                    Available {listState.selectedView === 'units' ? 'Units' : listState.selectedView === 'attachments' ? 'Attachments' : 'NCUs'}
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
                                                listState.selectedView === 'units' ? getDisabledItems('unit') :
                                                    null
                                    }
                                    in_list={false}
                                    handleListClick={handleListClick}
                                    handleOpenAttachments={handleOpenAttachments}
                                    testing={TESTING}
                                    selectedUnit={
                                        listState.selectedView === 'attachments' ? listState.selectedUnits.find((unit) => unit.temp_id === listState.selectedUnitTempID) :
                                            undefined
                                    }
                                    filterSort={filterSort}
                                    setFilterSort={setFilterSort}
                                />
                            </>
                        }
                        {listState.selectedFaction && listState.selectedCommander && listState.selectedView === 'save' &&
                            <SavePage />
                        }
                    </Stack>
                </Stack>
                <SelectView
                    setSelectedView={(view: VIEW_OPTIONS) => { listDispatch({ type: 'SET_SELECTED_VIEW', payload: view }) }}
                    {...listState}
                />
                { listState.awaitingResponse && <LoadingBackdrop /> }
            </Container>
        </Page>
    );
};

// ----------------------------------------------------------------------

function getUnitTempID(unit: Unit, selected_units: Unit[]) {
    const unit_index = selected_units.findIndex((selected_unit) => selected_unit.temp_id === unit.temp_id);
    if (unit_index === -1) { return null };
    return selected_units[unit_index].temp_id;
};