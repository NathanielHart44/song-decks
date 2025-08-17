/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Button,
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import { Commander, Faction } from "src/@types/types";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import EditAddCommander from "src/components/manage-content/edit-contents/EditAddCommander";
import EditAddFaction from "src/components/manage-content/edit-contents/EditAddFaction";
import { AddNew } from "./edit-contents/AddNew";
import { Action, State } from "./ManageCardContent";
// Removed edit screens for attachments, NCUs, and units

// ----------------------------------------------------------------------

type ContentTopProps = {
    contentState: State;
    contentDispatch: React.Dispatch<Action>;
    isMobile: boolean;
    handleFactionClick: (faction: Faction) => void;
    handleCommanderClick: (commander: Commander) => void;
    gridContainerStyles: SxProps<Theme>;
    gridItemStyles: SxProps<Theme>;
};

// ----------------------------------------------------------------------

export function ContentTop({
    contentState, contentDispatch, isMobile,
    handleFactionClick, handleCommanderClick,
    gridContainerStyles, gridItemStyles
}: ContentTopProps) {

    const theme = useTheme();
    const [selectedItem, setSelectedItem] = useState<Commander | null>(null);
    const [viewedItems, setViewedItems] = useState<Commander[] | null>(null);
    const [selectedItemType, setSelectedItemType] = useState<'commander_select' | 'commander' | null>(null);

    useEffect(() => {
        if (contentState.selectedCommander) {
            setSelectedItem(contentState.selectedCommander);
        } else if (!contentState.selectedCommander) {
            setSelectedItem(null);
        };
    }, [contentState.selectedCommander]);

    useEffect(() => {
        if (selectedItem && viewedItems) {
            if (selectedItemType === 'commander_select' || selectedItemType === 'commander') {
                if (!contentState.allCommanders.includes(selectedItem as Commander)) {
                    setSelectedItem(null);
                    contentDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
                };
            }
        };
    }, [contentState.allCommanders]);

    useEffect(() => {
        if (contentState.mode === 'commander_select' && contentState.viewedCommanders !== null) {
            setViewedItems(contentState.viewedCommanders);
            setSelectedItemType('commander_select');
        } else if (contentState.mode === 'commander' && contentState.viewedCommanders !== null) {
            setViewedItems(contentState.viewedCommanders);
            setSelectedItemType('commander');
        } else {
            setViewedItems(null);
            setSelectedItemType(null);
        };
    }, [contentState.mode, contentState.viewedCommanders]);

    return (
        <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h3'}>Manage Content</Typography>
            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'flex-start'}>
                {contentState.selectedFaction ?
                    <Stack>
                        <SelectableAvatar
                            item={contentState.selectedFaction}
                            altText={`SELECTED ${contentState.selectedFaction.name}`}
                            isMobile={isMobile}
                            handleClick={handleFactionClick}
                        />
                        <Button
                            size={'small'}
                            onClick={() => {
                                contentDispatch({ type: 'TOGGLE_ADD_NEW_FACTION' });
                            }}
                        >
                            Edit
                        </Button>
                    </Stack> :
                    <SelectableAvatar
                        item={contentState.selectedFaction}
                        altText={'DEFAULT FACTION'}
                        defaultIcon={'/icons/throne.png'}
                        isMobile={isMobile}
                        handleClick={handleFactionClick}
                        sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas }}
                    />
                }
                {selectedItem ?
                    <Stack>
                        <SelectableAvatar
                            item={selectedItem}
                            altText={`SELECTED ${selectedItem.name}`}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick}
                        />
                        <Button
                            size={'small'}
                            onClick={() => {
                                contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' });
                            }}
                        >
                            Edit
                        </Button>
                    </Stack> :
                    <SelectableAvatar
                        item={selectedItem}
                        altText={'DEFAULT ITEM'}
                        defaultIcon={'/icons/crown.svg'}
                        isMobile={isMobile}
                        handleClick={handleCommanderClick}
                        sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                    />
                }
            </Stack>

            {/* Only commanders remain in type selection */}
            {contentState.mode === 'type_select' &&
                <Grid container rowSpacing={2} columnSpacing={2} justifyContent={'center'}>
                    <Grid item sx={gridItemStyles} xs={8} sm={5} md={2.5}>
                        <Button
                            variant={'contained'}
                            size={"large"}
                            onClick={() => { contentDispatch({ type: 'SET_MODE', payload: 'commander_select' }); }}
                            fullWidth
                        >
                            Commanders
                        </Button>
                    </Grid>
                </Grid>
            }

            {contentState.factions && !contentState.selectedFaction && contentState.mode === 'faction_select' &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {contentState.factions.map((faction) => (
                            <Grid item key={faction.id + 'faction'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={faction}
                                    altText={faction.name}
                                    isMobile={isMobile}
                                    handleClick={handleFactionClick}
                                />
                            </Grid>
                        ))}
                        <Grid item sx={gridItemStyles}>
                            <AddNew
                                type={'faction'}
                                isMobile={isMobile}
                                handleClick={() => {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_FACTION' });
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            }
            {contentState.factions &&
                <EditAddFaction
                    faction={contentState.selectedFaction ? contentState.selectedFaction : null}
                    factions={contentState.factions}
                    editOpen={contentState.addNewFaction}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_FACTION' }); }}
                    setFactions={(factions: Faction[]) => { contentDispatch({ type: 'SET_FACTIONS', payload: factions }); }}
                />
            }

            {contentState.selectedFaction && viewedItems && !selectedItem && contentState.mode !== 'commander' && selectedItemType &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {viewedItems.map((item) => (
                            <Grid item key={item.id + 'item'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={item}
                                    altText={item.name}
                                    isMobile={isMobile}
                                    handleClick={() => {
                                        handleCommanderClick(item as Commander);
                                    }}
                                />
                            </Grid>
                        ))}
                        <Grid item sx={gridItemStyles}>
                            <AddNew
                                type={'commander'}
                                isMobile={isMobile}
                                handleClick={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' }); }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            }
            {contentState.factions && contentState.selectedFaction && contentState.allCommanders && (selectedItemType === 'commander_select' || selectedItemType === 'commander') &&
                <EditAddCommander
                    commander={contentState.selectedCommander !== null ? contentState.selectedCommander :
                        {
                            id: -1,
                            name: '',
                            img_url: '',
                            faction: contentState.selectedFaction,
                            commander_type: 'attachment'
                        }}
                    editOpen={contentState.addNewCommander}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' }); }}
                    commanders={contentState.allCommanders}
                    setCommanders={(commanders: Commander[]) => { contentDispatch({ type: 'SET_ALL_COMMANDERS', payload: commanders }); }}
                    factions={contentState.factions}
                />
            }
            {/* Attachment/NCU/Unit edit dialogs removed */}
        </Stack>
    );
}
