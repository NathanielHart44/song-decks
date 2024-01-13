/* eslint-disable react-hooks/exhaustive-deps */
import {
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    Divider,
    useTheme,
    ToggleButton,
    ToggleButtonGroup,
    TextField,
    Button,
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
    }, [listState.selectedFaction, listState.selectedCommander]);

    function getUnitTempID(unit: Unit, selected_units: Unit[]) {
        const unit_index = selected_units.findIndex((selected_unit) => selected_unit.temp_id === unit.temp_id);
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
        <Page title="List Builder">
            <Container maxWidth={false}>
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
                        {listState.selectedFaction && listState.selectedCommander && listState.selectedView !== 'my_list' && listState.selectedView !== 'settings' &&
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
                                                null
                                    }
                                    in_list={false}
                                    handleListClick={handleListClick}
                                    handleOpenAttachments={handleOpenAttachments}
                                    testing={TESTING}
                                    filterSort={filterSort}
                                    setFilterSort={setFilterSort}
                                />
                            </>
                        }
                        {listState.selectedFaction && listState.selectedCommander && listState.selectedView === 'settings' &&
                            <SettingsPage />
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

function SettingsPage() {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];
    const { isMobile } = useContext(MetadataContext);
    const { listState, listDispatch, handleSaveList, validSubmission } = useListBuildManager();

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        listDispatch({ type: 'SET_LIST_TITLE', payload: event.target.value });
    };

    const validation_info = validSubmission();

    return (
        <Stack width={isMobile ? '98%' : '65%'} justifyContent={'center'} alignItems={'center'} spacing={3}>
            <TextField
                label={'List Name'}
                variant={'outlined'}
                fullWidth
                value={listState.listTitle}
                onChange={handleTitleChange}
            />
            <Stack width={'100%'}>
                <Typography color={title_grey} variant={'subtitle2'}>Max Points</Typography>
                <ToggleButtonGroup
                    color="primary"
                    value={listState.maxPoints}
                    exclusive
                    fullWidth
                    size={'small'}
                >
                    {[30, 40, 50].map((points) => (
                        <ToggleButton
                            key={'points_' + points}
                            value={points}
                            onClick={() => { listDispatch({ type: 'SET_MAX_POINTS', payload: points }); } }
                        >
                            {points}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Grid container columnGap={2} rowGap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Grid item xs={12} md={5} lg={4}>
                    <Button
                        variant={'contained'}
                        fullWidth
                        onClick={() => { processTokens(() => { handleSaveList('create'); }); } }
                        disabled={!validation_info.valid}
                    >
                        Save
                    </Button>
                </Grid>
                <Grid item xs={12} md={5} lg={4}>
                    <Button
                        variant={'contained'}
                        fullWidth
                        color={'secondary'}
                        onClick={() => { listDispatch({ type: 'SET_SELECTED_VIEW', payload: 'my_list' }); } }
                    >
                        Delete
                    </Button>
                </Grid>
            </Grid>
            {validation_info.failure_reasons.length > 0 &&
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                    <Typography color={theme.palette.secondary.main} variant={'subtitle2'}>Invalid Submission</Typography>
                    <Divider sx={{ width: '65%' }} />
                    <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        {validation_info.failure_reasons.map((reason, index) => (
                            <Typography key={'reason_' + index} color={theme.palette.secondary.main} variant={'subtitle2'}>{reason}</Typography>
                        ))}
                    </Stack>
                </Stack>
            }
        </Stack>
    );
}