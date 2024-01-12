import {
    Box,
    Grid,
    Stack, Button, Slider, Typography, FormGroup, FormControlLabel, Checkbox
} from "@mui/material";
import { useState } from "react";
import { Attachment, NCU, Unit } from "src/@types/types";
import { AvailableSelection } from "./AvailableSelection";
import { Searchbar } from "src/components/Searchbar";
import { ListClickProps, gridContainerStyles, gridItemStyles } from "../../pages/ListBuilder";
import { capWords } from "src/utils/capWords";

// ----------------------------------------------------------------------

type ListAvailableSelectionsProps = {
    type: 'unit' | 'ncu' | 'attachment';
    in_list: boolean;
    availableItems: Unit[] | Attachment[] | NCU[] | null;
    disabledItems: Unit[] | NCU[] | null;
    handleListClick: (props: ListClickProps) => void;
    handleOpenAttachments?: (unit: Unit) => void;
    attachment_select?: boolean;
    testing?: boolean;
};

export function ListAvailableSelections({ type, in_list, availableItems, disabledItems, handleListClick, handleOpenAttachments, attachment_select, testing }: ListAvailableSelectionsProps) {

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pointsFilter, setPointsFilter] = useState<number[]>([0, 10]);
    const [pointsSort, setPointsSort] = useState<'asc' | 'desc'>('desc');
    const [factionFilter, setFactionFilter] = useState<'faction' | 'neutral' | 'all'>('all');
    const [unitTypeFilter, setUnitTypeFilter] = useState<string[]>(['infantry', 'cavalry', 'monster', 'war_machine']);

    function filterItems(items: Unit[] | NCU[] | Attachment[]): Unit[] | NCU[] | Attachment[] {
        return items.filter((item) => {
            const itemPointsCost = item.points_cost;
            if (itemPointsCost < pointsFilter[0] || itemPointsCost > pointsFilter[1]) {
                return false;
            }
            if (type === 'unit') {
                const unit = item as Unit;
                console.log(unit.unit_type, unitTypeFilter);
                if (!unitTypeFilter.includes(unit.unit_type)) {
                    return false;
                }

                const unit_name = unit.name.toLowerCase();
                const search_terms = searchTerm.toLowerCase().split(' ');
                const unit_matches = search_terms.some((term) => unit_name.includes(term));
                return unit_matches;
            } else {
                const item_name = item.name.toLowerCase();
                const search_terms = searchTerm.toLowerCase().split(' ');
                return search_terms.some((term) => item_name.includes(term));
            }
        });
    };

    function sortItems(items: Unit[] | NCU[] | Attachment[]): Unit[] | NCU[] | Attachment[] {
        return items.sort((a, b) => {
            // Check if items are of type 'Unit'
            const isUnitA = 'attachments' in a;
            const isUnitB = 'attachments' in b;
            const isAttachmentA = 'attachment_type' in a;
            const isAttachmentB = 'attachment_type' in b;
    
            let a_cost, b_cost, a_priority, b_priority;
    
            const a_is_commander = isAttachmentA && (a as Attachment).attachment_type === 'commander';
            const b_is_commander = isAttachmentB && (b as Attachment).attachment_type === 'commander';

            if (a_is_commander && !b_is_commander) return -1;
            if (!a_is_commander && b_is_commander) return 1;
            if (a_is_commander && b_is_commander) {
                // Prioritize Faction commanders over Neutral commanders
                if (a.faction.neutral !== b.faction.neutral) {
                    return a.faction.neutral ? 1 : -1;
                }
            }

            // Calculate total points cost for Units including attachments, else use the item's points_cost
            if (isUnitA) {
                a_cost = a.points_cost + (a as Unit).attachments.reduce((acc, att) => acc + att.points_cost, 0);
                // Determine the priority for Units based on faction and whether they have attachments
                a_priority = (a.faction.neutral ? 2 : 1) * 10 + ((a as Unit).attachments.some(att => att.attachment_type === 'commander') ? 0 : 5);
            } else {
                a_cost = a.points_cost;
                a_priority = 30; // A default priority for NCU or Attachment
            }
    
            if (isUnitB) {
                b_cost = b.points_cost + (b as Unit).attachments.reduce((acc, att) => acc + att.points_cost, 0);
                // Determine the priority for Units based on faction and whether they have attachments
                b_priority = (b.faction.neutral ? 2 : 1) * 10 + ((b as Unit).attachments.some(att => att.attachment_type === 'commander') ? 0 : 5);
            } else {
                b_cost = b.points_cost;
                b_priority = 30; // A default priority for NCU or Attachment
            }
    
            // First, sort by priority
            if (a_priority !== b_priority) {
                return a_priority - b_priority;
            }
    
            // Then, apply pointsSort preference for sorting by total cost
            if (a_cost !== b_cost) {
                return pointsSort === 'asc' ? a_cost - b_cost : b_cost - a_cost;
            }
    
            // If all else is equal, sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
    };

    return (
        <>
            {availableItems &&
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                    {!in_list &&
                        <>
                            <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                            <Grid container columnSpacing={2} rowSpacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                <Grid item xs={12} md={5} lg={4}>
                                    { type === 'unit' &&
                                        <Stack spacing={2} justifyContent={'center'} alignItems={'center'} width={'95%'}>
                                            <FormGroup row>
                                                {['infantry', 'cavalry', 'monster', 'war_machine'].map(unitType => (
                                                    <FormControlLabel
                                                        key={unitType + '_checkbox'}
                                                        control={
                                                            <Checkbox
                                                                defaultChecked
                                                                value={unitType}
                                                                onChange={(event) => {
                                                                    if (event.target.checked) {
                                                                        setUnitTypeFilter([...unitTypeFilter, unitType]);
                                                                    } else {
                                                                        setUnitTypeFilter(unitTypeFilter.filter(type => type !== unitType));
                                                                    }
                                                                }}
                                                            />
                                                        }
                                                        label={capWords(unitType)}
                                                    />
                                                ))}
                                            </FormGroup>
                                            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'} width={'95%'}>
                                                <Typography variant={'body2'}>Points</Typography>
                                                <Slider
                                                    size={'small'}
                                                    value={pointsFilter}
                                                    onChange={(event, newValue) => setPointsFilter(newValue as number[])}
                                                    valueLabelDisplay="auto"
                                                    aria-labelledby="range-slider"
                                                    getAriaValueText={(value) => `${value}`}
                                                    marks
                                                    min={0}
                                                    max={10}
                                                    step={1}
                                                />
                                            </Stack>
                                        </Stack>
                                    }
                                    <Button
                                        // variant={'contained'}
                                        fullWidth
                                        size={"small"}
                                    >
                                        Filters
                                    </Button>
                                </Grid>
                                <Grid item xs={12} md={5} lg={4}>
                                    <Button
                                        // variant={'contained'}
                                        fullWidth
                                        size={"small"}
                                    >
                                        Sort
                                    </Button>
                                </Grid>
                            </Grid>
                        </>}
                    <Box sx={{ width: '100%' }}>
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={gridContainerStyles}>
                            {sortItems(filterItems(availableItems)).map((item, index) => (
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