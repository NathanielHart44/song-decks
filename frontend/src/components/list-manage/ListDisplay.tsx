import { Autocomplete, Box, Button, Container, Dialog, Divider, Grid, IconButton, Paper, Skeleton, Stack, SxProps, TextField, Theme, Tooltip, Typography, createFilterOptions, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { List, ShortProfile } from "src/@types/types";
import Iconify from "src/components/base/Iconify";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "src/routes/paths";
import { encodeList } from "src/utils/convertList";
import { DeleteDialog } from "../base/DeleteDialog";
import { processTokens } from "src/utils/jwt";
import useListBuildManager from "src/hooks/useListBuildManager";
import { ListOverview } from "./ListOverview";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { MetadataContext } from "src/contexts/MetadataContext";
import { useApiCall } from "src/hooks/useApiCall";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

type ButtonActionType = {
    title: string;
    onClick: () => void;
    icon: string;
    icon_color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
    disabled: boolean;
};

// ----------------------------------------------------------------------

type ListDisplayProps = {
    type: 'manage' | 'select';
    list: List;
    allShortProfiles?: ShortProfile[];
    selectedList?: List | null;
    selectList?: (list: List | null) => void;
    handleSharedList?: (list: List, action: 'confirm' | 'decline') => void;
};

export function ListDisplay({ type, list, allShortProfiles, selectedList, selectList, handleSharedList }: ListDisplayProps) {

    const theme = useTheme();
    const { isMobile } = useContext(MetadataContext);
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [shareOpen, setShareOpen] = useState<boolean>(false);
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { listDispatch, handleDeleteList } = useListBuildManager();

    const unit_count = list.units.length;
    const ncu_count = list.ncus.length;

    let buttonActions: ButtonActionType[] = [];
    if (type === 'manage' && !(list.is_draft && list.shared_from)) {
        buttonActions = [
            {
                title: 'Edit',
                onClick: () => {
                    const encoded_list = encodeList(list);
                    const url = `${PATH_PAGE.list_builder}/${encoded_list}`;
                    navigate(url);
                },
                icon: 'eva:edit-2-outline',
                disabled: false
            },
            {
                title: 'Delete',
                onClick: () => {
                    listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: false });
                    setDeleteOpen(true);
                },
                icon: 'eva:trash-2-outline',
                disabled: false
            },
            // {
            //     title: 'Copy Link',
            //     onClick: () => { },
            //     icon: 'eva:copy-outline',
            //     disabled: true
            // },
            {
                title: 'Share',
                onClick: () => { setShareOpen(true) },
                icon: 'eva:share-outline',
                disabled: false
            },
            {
                title: 'View',
                onClick: () => { setPreviewOpen(true) },
                icon: 'eva:eye-outline',
                disabled: false
            }
        ];
    } else if (type === 'manage' && (list.is_draft && list.shared_from)) {
        buttonActions = [
            {
                title: 'Confirm',
                onClick: () => { handleSharedList && handleSharedList(list, 'confirm') },
                icon: 'eva:checkmark-outline',
                icon_color: 'success',
                disabled: false
            },
            {
                title: 'Decline',
                onClick: () => { handleSharedList && handleSharedList(list, 'decline') },
                icon: 'eva:close-outline',
                icon_color: 'error',
                disabled: false
            },
            {
                title: 'View',
                onClick: () => { setPreviewOpen(true) },
                icon: 'eva:eye-outline',
                disabled: false
            }
        ];
    } else {
        const is_selected = selectList && selectedList && selectedList.id === list.id;

        buttonActions = [
            {
                title: is_selected ? 'Unselect' : 'Select',
                onClick: () => {
                    selectList && (is_selected ? selectList(null) : selectList(list));
                },
                icon: is_selected ? 'eva:close-outline' : 'eva:checkmark-outline',
                icon_color: is_selected ? 'error' : 'success',
                disabled: false
            },
            {
                title: 'View',
                onClick: () => { setPreviewOpen(true) },
                icon: 'eva:eye-outline',
                disabled: false
            }
        ];
    };

    const gridItemStyles: SxProps<Theme> = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '320px',
        height: '100%',
    };

    return (
        <Grid item sx={gridItemStyles}>
            <Paper sx={{ p: 2, width: '100%', height: '100%' }} elevation={3}>
                {list.is_draft &&
                    <Box sx={{ position: 'absolute', width: '300px', pointerEvents: 'none' }}>
                        <Tooltip
                            title={list.shared_from ? 'Shared With You' : 'Draft'}
                            arrow
                            placement={"top"}
                            sx={{
                                position: 'relative',
                                top: '-10px',
                                right: -260,
                                pointerEvents: 'auto',
                            }}
                        >
                            <IconButton
                                onClick={() => { }}
                                disabled={false}
                            >
                                <Iconify icon={'lucide:file-warning'} height={20} width={20} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                }
                <Stack justifyContent={'space-between'} alignItems={'center'} spacing={1}>
                    <Stack direction={'row'} spacing={1}>
                        <Tooltip title={list.faction.name} arrow placement={"top"}>
                            <Box sx={{ width: '50px', height: '50px' }}>
                                <LazyLoadImage
                                    alt={list.faction.name + ' icon'}
                                    src={list.faction.img_url}
                                    placeholder={<Skeleton variant={'rectangular'} width={50} height={50} />}
                                />
                            </Box>
                        </Tooltip>
                        <Tooltip title={list.commander.name} arrow placement={"top"}>
                            <Box sx={{ width: '50px', height: '50px' }}>
                                <LazyLoadImage
                                    alt={list.commander.name + ' icon'}
                                    src={list.commander.img_url}
                                    placeholder={<Skeleton variant={'rectangular'} width={50} height={50} />}
                                    style={{ borderRadius: '6px', height: '50px', width: '50px' }}
                                />
                            </Box>
                        </Tooltip>
                    </Stack>
                    <Typography
                        variant={'body1'}
                        overflow={'hidden'}
                        textOverflow={'ellipsis'}
                        whiteSpace={'nowrap'}
                        sx={{ width: '100%', textAlign: 'center' }}
                    >
                        {(list.is_draft && list.shared_from) ?
                            `(${list.shared_from.user.username}) ${list.name}` :
                            list.name
                        }
                    </Typography>
                    <Divider sx={{ width: '100%' }} />

                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                        <Typography variant={'body2'} color={'text.secondary'}>
                            {unit_count} Units
                        </Typography>
                        <Typography variant={'body2'} color={'text.secondary'}>/</Typography>
                        <Typography variant={'body2'} color={'text.secondary'}>
                            {ncu_count} NCUs
                        </Typography>
                        <Typography variant={'body2'} color={'text.secondary'}>/</Typography>
                        <Typography variant={'body2'} color={'text.secondary'}>
                            {unit_count + ncu_count} Activations
                        </Typography>
                    </Stack>
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                        <Typography
                            variant={'body2'}
                            color={calcTotalPoints(list) > list.points_allowed ? theme.palette.secondary.main : 'text.secondary'}
                        >
                            Total:
                        </Typography>
                        <Typography
                            variant={'body2'}
                            color={calcTotalPoints(list) > list.points_allowed ? theme.palette.secondary.main : 'text.secondary'}
                        >
                            {calcTotalPoints(list)} / {list.points_allowed}
                        </Typography>
                    </Stack>
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                        <Typography
                            variant={'body2'}
                            color={
                                (list.faction.neutral || !list.faction.can_use_neutral) ? 'text.secondary' :
                                    (calcNeutralPoints(list) > Math.round(list.points_allowed * 0.3)) ? theme.palette.secondary.main : 'text.secondary'
                            }
                        >
                            Neutral:
                        </Typography>
                        <Typography
                            variant={'body2'}
                            color={
                                (list.faction.neutral || !list.faction.can_use_neutral) ? 'text.secondary' :
                                    (calcNeutralPoints(list) > Math.round(list.points_allowed * 0.3)) ? theme.palette.secondary.main : 'text.secondary'
                            }
                        >
                            {
                                (list.faction.neutral || !list.faction.can_use_neutral) ? '-/-' :
                                    `${calcNeutralPoints(list)}/${Math.round(list.points_allowed * 0.3)}`
                            }
                        </Typography>
                    </Stack>

                    <Divider sx={{ width: '100%' }} />
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                        {buttonActions.map((action, index) => (
                            <Tooltip key={index} title={action.title} arrow placement={"bottom"}>
                                <IconButton
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                    color={action.icon_color ? action.icon_color : 'default'}
                                >
                                    <Iconify icon={action.icon} height={20} width={20} />
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Stack>
                </Stack>
            </Paper>
            <ListOverview
                isMobile={isMobile}
                currentList={list}
                dialogOpen={previewOpen}
                setDialogOpen={setPreviewOpen}
            />
            <DeleteDialog
                open={deleteOpen}
                onClose={() => { setDeleteOpen(false) }}
                onClick={() => {
                    processTokens(() => { handleDeleteList(list.id) });
                }}
            />
            <ListSender
                selectedList={list}
                allShortProfiles={allShortProfiles ?? []}
                dialogOpen={shareOpen}
                setDialogOpen={setShareOpen}
            />
        </Grid>
    );
};

// ----------------------------------------------------------------------

type ListSenderProps = {
    selectedList: List;
    allShortProfiles: ShortProfile[];
    dialogOpen: boolean;
    setDialogOpen: (dialogOpen: boolean) => void;
};

function ListSender({ selectedList, allShortProfiles, dialogOpen, setDialogOpen }: ListSenderProps) {

    const { currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

    const [selectedProfile, setSelectedProfile] = useState<ShortProfile>();
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    
    const filter = createFilterOptions<ShortProfile>();

    const handleSearchChange = (event: React.ChangeEvent<{}>, value: string) => {
        setDropdownOpen(value.length >= 3);
    };

    const handleChange = (event: React.ChangeEvent<{}>, newValue: ShortProfile | string | null) => {
        if (typeof newValue === 'string') {
            setSelectedProfile(undefined);
        } else if (newValue !== null) {
            setSelectedProfile(newValue);
            setDropdownOpen(false);
        } else {
            setSelectedProfile(undefined);
            setDropdownOpen(false);
        }
    };

    const shareList = async () => {
        setAwaitingResponse(true);
        const url = `share_list/${selectedList.id}/${selectedProfile?.username}`;
        apiCall(url, 'GET', null, (data) => {
            enqueueSnackbar(data.detail);
            setSelectedProfile(undefined);
            setDialogOpen(false);
            if (currentUser?.id === selectedProfile?.id) {
                window.location.reload();
            };
        });
        setAwaitingResponse(false);
    };

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
            onClick={() => {
                setDialogOpen(false);
                setSelectedProfile(undefined);
            }}
        >
            <Container maxWidth={'sm'} sx={{ height: '100%' }}>
                <Stack
                    spacing={2}
                    justifyContent={'center'}
                    alignItems={'center'}
                    sx={{ width: '100%', height: '100%' }}
                    onClick={(event) => { event.stopPropagation() }}
                >
                    <Autocomplete
                        open={dropdownOpen}
                        value={selectedProfile}
                        onChange={handleChange}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            return filtered;
                        }}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        id="list-sender-autocomplete"
                        options={allShortProfiles.sort((a, b) => -(b.username[0] ?? 'z').localeCompare((a.username[0] ?? 'z')))}
                        // groupBy={(option) => option.username[0].toUpperCase()}
                        getOptionLabel={(option) => {
                            if (typeof option === 'string') {
                                return option;
                            }
                            return `${option.username} (${option.full_name})`;
                        }}
                        renderOption={(props, option) => <li {...props}>{`${option.username} (${option.full_name})`}</li>}
                        fullWidth
                        freeSolo
                        onInputChange={handleSearchChange}
                        renderInput={(params) => (
                            <TextField {...params} label={"Username"} />
                        )}
                    />

                    <Button
                        variant={'contained'}
                        onClick={() => { processTokens(shareList) }}
                        disabled={awaitingResponse || !selectedProfile}
                        size={'large'}
                        fullWidth
                    >
                        Share
                    </Button>
                    <Button
                        variant={'contained'}
                        color={'secondary'}
                        onClick={() => {
                            setDialogOpen(false);
                            setSelectedProfile(undefined);
                        }}
                        size={'large'}
                        fullWidth
                        disabled={awaitingResponse}
                    >
                        Cancel
                    </Button>

                </Stack>
            </Container>
        </Dialog>
    )
};

// ----------------------------------------------------------------------

export function calcTotalPoints(list: List) {
    let total = 0;
    list.units.forEach((unit) => {
        total += unit.points_cost;
        unit.attachments.forEach((attachment) => {
            total += attachment.points_cost;
        });
    });
    list.ncus.forEach((ncu) => {
        total += ncu.points_cost;
    });
    return total;
};

export function calcNeutralPoints(list: List) {
    let total = 0;
    list.units.forEach((unit) => {
        if (unit.faction.neutral) {
            total += unit.points_cost;
            unit.attachments.forEach((attachment) => {
                if (attachment.faction.neutral) {
                    total += attachment.points_cost;
                }
            });
        }
    });
    list.ncus.forEach((ncu) => {
        if (ncu.faction.neutral) {
            total += ncu.points_cost;
        }
    });
    return total;
};