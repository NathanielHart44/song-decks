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
import { Commander, Faction, Attachment, NCU, Unit } from "src/@types/types";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import EditAddCommander from "src/components/manage-content/edit-contents/EditAddCommander";
import EditAddFaction from "src/components/manage-content/edit-contents/EditAddFaction";
import { AddNew } from "./edit-contents/AddNew";
import { Action, State } from "./ManageCardContent";
import EditAddAttachment from "./edit-contents/EditAddAttachment";
import EditAddNCU from "./edit-contents/EditAddNCU";
import EditAddUnit from "./edit-contents/EditAddUnit";

// ----------------------------------------------------------------------

type ContentTopProps = {
    contentState: State;
    contentDispatch: React.Dispatch<Action>;
    isMobile: boolean;
    handleFactionClick: (faction: Faction) => void;
    handleCommanderClick: (commander: Commander) => void;
    handleAttachmentClick: (attachment: Attachment) => void;
    handleNcuClick: (ncu: NCU) => void;
    handleUnitClick: (unit: Unit) => void;
    gridContainerStyles: SxProps<Theme>;
    gridItemStyles: SxProps<Theme>;
};

// ----------------------------------------------------------------------

export function ContentTop({
    contentState, contentDispatch, isMobile,
    handleFactionClick, handleCommanderClick, handleAttachmentClick, handleNcuClick, handleUnitClick,
    gridContainerStyles, gridItemStyles
}: ContentTopProps) {

    const theme = useTheme();
    const [selectedItem, setSelectedItem] = useState<Commander | Attachment | NCU | Unit | null>(null);
    const [viewedItems, setViewedItems] = useState<Commander[] | Attachment[] | NCU[] | Unit[] |null>(null);
    const [selectedItemType, setSelectedItemType] = useState<'commander_select' | 'commander' | 'attachment' | 'ncu' | 'unit' | null>(null);

    useEffect(() => {
        if (contentState.selectedCommander) {
            setSelectedItem(contentState.selectedCommander);
        } else if (contentState.selectedAttachment) {
            setSelectedItem(contentState.selectedAttachment);
        } else if (contentState.selectedNCU) {
            setSelectedItem(contentState.selectedNCU);
        } else if (contentState.selectedUnit) {
            setSelectedItem(contentState.selectedUnit);
        } else if (!contentState.selectedCommander && !contentState.selectedAttachment && !contentState.selectedNCU && !contentState.selectedUnit) {
            setSelectedItem(null);
        };

    }, [contentState.selectedCommander, contentState.selectedAttachment, contentState.selectedNCU, contentState.selectedUnit]);

    useEffect(() => {
        if (contentState.mode === 'commander_select' && contentState.viewedCommanders !== null) {
            setViewedItems(contentState.viewedCommanders);
            setSelectedItemType('commander_select');
        } else if (contentState.mode === 'commander' && contentState.viewedCommanders !== null) {
            setViewedItems(contentState.viewedCommanders);
            setSelectedItemType('commander');
        } else if (contentState.mode === 'attachments' && contentState.factionAttachments !== null) {
            setViewedItems(contentState.factionAttachments);
            setSelectedItemType('attachment');
        } else if (contentState.mode === 'ncus' && contentState.factionNCUs !== null) {
            setViewedItems(contentState.factionNCUs);
            setSelectedItemType('ncu');
        } else if (contentState.mode === 'units' && contentState.factionUnits !== null) {
            setViewedItems(contentState.factionUnits);
            setSelectedItemType('unit');
        } else {
            setViewedItems(null);
            setSelectedItemType(null);
        };
    }, [contentState.mode, contentState.viewedCommanders, contentState.factionAttachments, contentState.factionNCUs, contentState.factionUnits]);

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
                            handleClick={
                                selectedItemType === 'commander' ? handleCommanderClick :
                                    selectedItemType === 'attachment' ? handleAttachmentClick :
                                        selectedItemType === 'ncu' ? handleNcuClick :
                                            selectedItemType === 'unit' ? handleUnitClick :
                                                () => { }
                            }
                        />
                        <Button
                            size={'small'}
                            onClick={() => {
                                if (selectedItemType === 'commander') {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' });
                                } else if (selectedItemType === 'attachment') {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_ATTACHMENT' });
                                } else if (selectedItemType === 'ncu') {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_NCU' });
                                } else if (selectedItemType === 'unit') {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_UNIT' });
                                }
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
                        handleClick={
                            selectedItemType === 'commander' ? handleCommanderClick :
                                selectedItemType === 'attachment' ? handleAttachmentClick :
                                    selectedItemType === 'ncu' ? handleNcuClick :
                                        selectedItemType === 'unit' ? handleUnitClick :
                                            () => { }
                        }
                        sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                    />
                }
            </Stack>

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
                    <Grid item sx={gridItemStyles} xs={8} sm={5} md={2.5}>
                        <Button
                            variant={'contained'}
                            size={"large"}
                            onClick={() => { contentDispatch({ type: 'SET_MODE', payload: 'attachments' }); }}
                            fullWidth
                        >
                            Attachments
                        </Button>
                    </Grid>
                    <Grid item sx={gridItemStyles} xs={8} sm={5} md={2.5}>
                        <Button
                            variant={'contained'}
                            size={"large"}
                            onClick={() => { contentDispatch({ type: 'SET_MODE', payload: 'ncus' }); }}
                            fullWidth
                        >
                            NCUs
                        </Button>
                    </Grid>
                    <Grid item sx={gridItemStyles} xs={8} sm={5} md={2.5}>
                        <Button
                            variant={'contained'}
                            size={"large"}
                            onClick={() => { contentDispatch({ type: 'SET_MODE', payload: 'units' }); }}
                            fullWidth
                        >
                            Units
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
                                        if (selectedItemType === 'commander') {
                                            handleCommanderClick(item as Commander);
                                        } else if (selectedItemType === 'commander_select') {
                                            handleCommanderClick(item as Commander);
                                        } else if (selectedItemType === 'attachment') {
                                            handleAttachmentClick(item as Attachment);
                                        } else if (selectedItemType === 'ncu') {
                                            handleNcuClick(item as NCU);
                                        } else if (selectedItemType === 'unit') {
                                            handleUnitClick(item as Unit);
                                        }
                                    }}
                                />
                            </Grid>
                        ))}
                        <Grid item sx={gridItemStyles}>
                            <AddNew
                                type={selectedItemType as 'commander' | 'attachment' | 'ncu' | 'unit'}
                                isMobile={isMobile}
                                handleClick={() => {
                                    if (selectedItemType === 'commander') {
                                        contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' });
                                    } else if (selectedItemType === 'attachment') {
                                        contentDispatch({ type: 'TOGGLE_ADD_NEW_ATTACHMENT' });
                                    } else if (selectedItemType === 'ncu') {
                                        contentDispatch({ type: 'TOGGLE_ADD_NEW_NCU' });
                                    } else if (selectedItemType === 'unit') {
                                        contentDispatch({ type: 'TOGGLE_ADD_NEW_UNIT' });
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            }
            {contentState.factions && contentState.selectedFaction && contentState.allCommanders && selectedItemType === 'commander' &&
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
            { contentState.factions && contentState.selectedFaction && contentState.factionAttachments && selectedItemType === 'attachment' &&
                <EditAddAttachment
                    attachment={contentState.selectedAttachment !== null ? contentState.selectedAttachment :
                        {
                            id: -1,
                            name: '',
                            img_url: '',
                            main_url: '',
                            points_cost: 0,
                            type: 'infantry',
                            faction: contentState.selectedFaction,
                            is_commander: false
                        }}
                    editOpen={contentState.addNewAttachment}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_ATTACHMENT' }); }}
                    attachments={contentState.factionAttachments}
                    setAttachments={(attachments: Attachment[]) => { contentDispatch({ type: 'SET_FACTION_ATTACHMENTS', payload: attachments }); }}
                    factions={contentState.factions}
                />
            }
            { contentState.factions && contentState.selectedFaction && contentState.factionNCUs && selectedItemType === 'ncu' &&
                <EditAddNCU
                    ncu={contentState.selectedNCU !== null ? contentState.selectedNCU :
                        {
                            id: -1,
                            name: '',
                            img_url: '',
                            main_url: '',
                            points_cost: 0,
                            faction: contentState.selectedFaction,
                        }}
                    editOpen={contentState.addNewNCU}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_NCU' }); }}
                    ncus={contentState.factionNCUs}
                    setNCUs={(ncus: NCU[]) => { contentDispatch({ type: 'SET_FACTION_NCUs', payload: ncus }); }}
                    factions={contentState.factions}
                />
            }
            { contentState.factions && contentState.selectedFaction && contentState.factionUnits && selectedItemType === 'unit' &&
                <EditAddUnit
                    unit={contentState.selectedUnit !== null ? contentState.selectedUnit :
                        {
                            id: -1,
                            name: '',
                            img_url: '',
                            main_url: '',
                            points_cost: 0,
                            type: 'infantry',
                            faction: contentState.selectedFaction,
                            is_commander: false
                        }}
                    editOpen={contentState.addNewUnit}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_UNIT' }); }}
                    units={contentState.factionUnits}
                    setUnits={(units: Unit[]) => { contentDispatch({ type: 'SET_FACTION_UNITS', payload: units }); }}
                    factions={contentState.factions}
                />
            }
        </Stack>
    );
}
