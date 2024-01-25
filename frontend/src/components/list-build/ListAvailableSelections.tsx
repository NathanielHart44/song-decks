import {
    Box,
    Grid,
    Stack,
    Button,
    Slider,
    Typography,
    FormGroup,
    FormControlLabel,
    Checkbox,
    ToggleButtonGroup,
    ToggleButton,
    useTheme,
    alpha,
    Drawer,
    Divider
} from "@mui/material";
import { useContext, useState } from "react";
import { Attachment, NCU, Unit } from "src/@types/types";
import { AvailableSelection } from "./AvailableSelection";
import { Searchbar } from "src/components/Searchbar";
import { DEFAULT_FILTER_SORT, FilterSortType, ListClickProps, gridContainerStyles, gridItemStyles } from "../../pages/ListBuilder";
import { capWords } from "src/utils/capWords";
import { MetadataContext } from "src/contexts/MetadataContext";
import Iconify from "../base/Iconify";
import useListBuildManager from "src/hooks/useListBuildManager";

// ----------------------------------------------------------------------

type ListAvailableSelectionsProps = {
    type: 'unit' | 'ncu' | 'attachment';
    in_list: boolean;
    availableItems: Unit[] | Attachment[] | NCU[] | null;
    disabledItems: Unit[] | NCU[] | null;
    handleListClick: (props: ListClickProps) => void;
    filterSort: FilterSortType;
    setFilterSort: (arg0: FilterSortType) => void;
    handleOpenAttachments?: (unit: Unit) => void;
    attachment_select?: boolean;
    selectedUnit?: Unit;
    testing?: boolean;
};

export function ListAvailableSelections({
    type, in_list, availableItems, disabledItems, handleListClick, handleOpenAttachments, attachment_select, selectedUnit, testing, filterSort, setFilterSort
}: ListAvailableSelectionsProps) {

    const { listState } = useListBuildManager();
    const theme = useTheme();
    const open_color = alpha(theme.palette.primary.main, 0.24);

    const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

    function filterItems(items: Unit[] | NCU[] | Attachment[]): Unit[] | NCU[] | Attachment[] {
        return items.filter((item) => {
            const itemPointsCost = item.points_cost;
            if (itemPointsCost < filterSort.pointsFilter[0] || itemPointsCost > filterSort.pointsFilter[1]) {
                return false;
            }
            if (filterSort.factionFilter === 'faction' && item.faction.neutral) {
                return false;
            } else if (filterSort.factionFilter === 'neutral' && !item.faction.neutral) {
                return false;
            }
            if (type === 'attachment' && selectedUnit) {
                const attachment = item as Attachment;
                if (attachment.type !== selectedUnit.unit_type) {
                    return false;
                }
            }
            if (type === 'unit') {
                const unit = item as Unit;
                if (!filterSort.unitTypeFilter.includes(unit.unit_type)) {
                    return false;
                }
                if (unit.status === 'commander_unit') {
                    if (listState.selectedCommander && unit.attached_commander) {
                        if (listState.selectedCommander.id !== unit.attached_commander.id) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (unit.status === 'commander') {
                    if (listState.selectedCommander?.name !== unit.name) {
                        return false;
                    }
                }

                const unit_name = unit.name.toLowerCase();
                const search_terms = filterSort.searchTerm.toLowerCase().split(' ');
                const unit_matches = search_terms.some((term) => unit_name.includes(term));
                return unit_matches;
            } else {
                const item_name = item.name.toLowerCase();
                const search_terms = filterSort.searchTerm.toLowerCase().split(' ');
                return search_terms.some((term) => item_name.includes(term));
            }
        });
    };

    return (
        <>
            {availableItems &&
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                    {!in_list &&
                        <>
                            <Stack
                                width={'85%'}
                                direction={'row'}
                                spacing={2}
                                justifyContent={'flex-end'}
                                alignItems={'center'}
                                sx={{ pb: 2 }}
                            >
                                <Button
                                    variant={'outlined'}
                                    onClick={() => setFiltersOpen(true)}
                                    sx={{ backgroundColor: filtersOpen ? open_color : 'transparent' }}
                                >
                                    Filters
                                </Button>
                                <Button
                                    variant={'outlined'}
                                    onClick={() => setFilterSort({ ...filterSort, pointsSort: filterSort.pointsSort === 'asc' ? 'desc' : 'asc' })}
                                    endIcon={filterSort.pointsSort === 'asc' ?
                                    <Iconify icon={'eva:arrow-upward-outline'} /> :
                                    <Iconify icon={'eva:arrow-downward-outline'} />
                                    }
                                >
                                    Sort
                                </Button>
                            </Stack>
                            <FilterComp
                                filtersOpen={filtersOpen}
                                setFiltersOpen={setFiltersOpen}
                                filterSort={filterSort}
                                setFilterSort={setFilterSort}
                            />
                        </>
                    }
                    <Box sx={{ width: '100%' }}>
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={gridContainerStyles}>
                            {sortItems(type, filterItems(availableItems), filterSort).map((item, index) => (
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
                                    attachment_select={attachment_select}
                                    testing={testing}
                                />
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            }
        </>
    );
};

// ----------------------------------------------------------------------

type FilterCompProps = {
    filtersOpen: boolean;
    setFiltersOpen: (arg0: boolean) => void;
    filterSort: FilterSortType;
    setFilterSort: (arg0: FilterSortType) => void;
};

function FilterComp({ filtersOpen, setFiltersOpen, filterSort, setFilterSort }: FilterCompProps) {

    const { isMobile } = useContext(MetadataContext);

    function resetAllDisabled(){
        const keys = Object.keys(filterSort);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (Array.isArray(filterSort[key as keyof FilterSortType]) && (typeof filterSort[key as keyof FilterSortType][0] === 'string' )) {
                if (filterSort[key as keyof FilterSortType].length !== DEFAULT_FILTER_SORT[key as keyof FilterSortType].length) {
                    return false;
                }
            } else {
                if (JSON.stringify(filterSort[key as keyof FilterSortType]) !== JSON.stringify(DEFAULT_FILTER_SORT[key as keyof FilterSortType])) {
                    return false;
                }
            }
        }
        return true;
    };

    return (
        <Drawer
            anchor={'right'}
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            sx={{
                '& .MuiDrawer-paper': { width: isMobile ? '60%' : '30%' },
                position: 'relative'
            }}
        >
            <Stack spacing={2} justifyContent={'center'} alignItems={'center'} width={'92%'} sx={{ mt: 2, px: 1, mx: 1 }}>
                <Typography variant={'h4'}>Filters</Typography>
                <Divider sx={{ width: '65%' }} />
                <Searchbar
                    searchTerm={filterSort.searchTerm}
                    setSearchTerm={(newTerm) => setFilterSort({ ...filterSort, searchTerm: newTerm })}
                    width={'100%'}
                />
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <ToggleButtonGroup
                        color="primary"
                        value={filterSort.factionFilter}
                        exclusive
                        size={'small'}
                        fullWidth
                    >
                        <ToggleButton value={'all'} onClick={() => { setFilterSort({ ...filterSort, factionFilter: 'all' }); } }>
                            All
                        </ToggleButton>
                        <ToggleButton value={'faction'} onClick={() => { setFilterSort({ ...filterSort, factionFilter: 'faction' }); } }>
                            Faction
                        </ToggleButton>
                        <ToggleButton value={'neutral'} onClick={() => { setFilterSort({ ...filterSort, factionFilter: 'neutral' }); } }>
                            Neutral
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
                <FormGroup>
                    {['infantry', 'cavalry', 'monster', 'war_machine'].map(unitType => (
                        <FormControlLabel
                            key={unitType + '_checkbox'}
                            control={
                                <Checkbox
                                    checked={filterSort.unitTypeFilter.includes(unitType)}
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            setFilterSort({ ...filterSort, unitTypeFilter: [...filterSort.unitTypeFilter, unitType] });
                                        } else {
                                            setFilterSort({ ...filterSort, unitTypeFilter: filterSort.unitTypeFilter.filter(type => type !== unitType) });
                                        }
                                    }}
                                />
                            }
                            label={capWords(unitType)}
                        />
                    ))}
                </FormGroup>
                <Stack justifyContent={'center'} alignItems={'center'} width={'95%'} sx={{ pb: 4 }}>
                    <Slider
                        size={'small'}
                        value={filterSort.pointsFilter}
                        onChange={(event, newValue) => setFilterSort({ ...filterSort, pointsFilter: newValue as number[] })}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        getAriaValueText={(value) => `${value}`}
                        marks
                        min={0}
                        max={10}
                        step={1}
                    />
                    <Typography variant={'body2'}>Points</Typography>
                </Stack>
            </Stack>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 0,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Stack
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'80%'}
                    spacing={2}
                >
                    <Button
                        variant={'contained'}
                        color={'secondary'}
                        onClick={() => { setFilterSort(DEFAULT_FILTER_SORT) }}
                        fullWidth
                        disabled={resetAllDisabled()}
                    >
                        Reset All
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
};

export function sortItems(type: 'unit' | 'ncu' | 'attachment', items: Unit[] | NCU[] | Attachment[], filterSort: FilterSortType): Unit[] | NCU[] | Attachment[] {
    items.sort((a, b) => {
        // Check if items are of type 'Unit'
        const isUnitA = 'unit_type' in a;
        const isUnitB = 'unit_type' in b;
        const isAttachmentA = 'attachment_type' in a;
        const isAttachmentB = 'attachment_type' in b;

        let a_cost, b_cost, a_priority, b_priority;

        const a_is_commander = (isAttachmentA && (a as Attachment).attachment_type === 'commander') || (isUnitA && (a as Unit).status === 'commander');
        const b_is_commander = (isAttachmentB && (b as Attachment).attachment_type === 'commander') || (isUnitB && (b as Unit).status === 'commander');

        if (a_is_commander && !b_is_commander) return -1;
        if (!a_is_commander && b_is_commander) return 1;
        if (a_is_commander && b_is_commander) {
            // Prioritize Faction commanders over Neutral commanders
            if (a.faction.neutral !== b.faction.neutral) {
                return a.faction.neutral ? 1 : -1;
            }
        }

        if (isUnitA) {
            a_cost = a.points_cost + (a as Unit).attachments.reduce((acc, att) => acc + att.points_cost, 0);
            // Adjust priority based on faction, attachments
            a_priority = (a.faction.neutral ? 10 : 0) + ((a as Unit).attachments.length === 0 ? 50 : 0);
        } else {
            a_cost = a.points_cost;
            a_priority = 300; // Default higher priority for NCU or Attachment
        }
    
        if (isUnitB) {
            b_cost = b.points_cost + (b as Unit).attachments.reduce((acc, att) => acc + att.points_cost, 0);
            // Adjust priority based on faction, attachments
            b_priority = (b.faction.neutral ? 10 : 0) + ((b as Unit).attachments.length === 0 ? 50 : 0);
        } else {
            b_cost = b.points_cost;
            b_priority = 300; // Default higher priority for NCU or Attachment
        }
    
        // Sort primarily by points cost, then by priority
        if (a_cost !== b_cost) {
            return filterSort.pointsSort === 'asc' ? a_cost - b_cost : b_cost - a_cost;
        } else if (a_priority !== b_priority) {
            return a_priority - b_priority;
        }

        return a.name.localeCompare(b.name);
    });

    if (type === 'ncu') {
        return items;
    } else if (type === 'unit') {
        return items.sort((a, b) => {
            if (!('attachments' in a) || !('attachments' in b)) return 0;
            const containsCommanderA = (a as Unit).attachments.some(att => att.attachment_type === 'commander');
            const containsCommanderB = (b as Unit).attachments.some(att => att.attachment_type === 'commander');
    
            if (containsCommanderA && !containsCommanderB) return -1;
            if (!containsCommanderA && containsCommanderB) return 1;
    
            return 0; // Keep existing order for non-commander items
        });
    } else {
        return items;
    };
};