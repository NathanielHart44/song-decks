import { Box, Divider, Grid, IconButton, Paper, Skeleton, Stack, SxProps, Theme, Tooltip, Typography, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { List } from "src/@types/types";
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
    selectedList?: List | null;
    selectList?: (list: List | null) => void;
};

export function ListDisplay({ type, list, selectedList, selectList }: ListDisplayProps) {

    const theme = useTheme();
    const { isMobile } = useContext(MetadataContext);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { handleDeleteList } = useListBuildManager();

    const unit_count = list.units.length;
    const ncu_count = list.ncus.length;

    let buttonActions: ButtonActionType[] = [];
    if (type === 'manage') {
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
                onClick: () => { setDeleteOpen(true) },
                icon: 'eva:trash-2-outline',
                disabled: false
            },
            // {
            //     title: 'Copy Link',
            //     onClick: () => { },
            //     icon: 'eva:copy-outline',
            //     disabled: true
            // },
            // {
            //     title: 'Share',
            //     onClick: () => { },
            //     icon: 'eva:share-outline',
            //     disabled: true
            // },
            {
                title: 'View',
                onClick: () => { setDialogOpen(true) },
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
                onClick: () => { setDialogOpen(true) },
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
                            title={'Draft'}
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
                        {list.name}
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
                                    (calcNeutralPoints(list) > list.points_allowed * 0.3) ? theme.palette.secondary.main : 'text.secondary'
                            }
                        >
                            Neutral:
                        </Typography>
                        <Typography
                            variant={'body2'}
                            color={
                                (list.faction.neutral || !list.faction.can_use_neutral) ? 'text.secondary' :
                                    (calcNeutralPoints(list) > list.points_allowed * 0.3) ? theme.palette.secondary.main : 'text.secondary'
                            }
                        >
                            {
                                (list.faction.neutral || !list.faction.can_use_neutral) ? '-/-' :
                                    (calcNeutralPoints(list) > list.points_allowed * 0.3) ? `${calcNeutralPoints(list)}/${list.points_allowed * 0.3}` :
                                        `${calcNeutralPoints(list)}/${list.points_allowed}`
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
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
            />
            <DeleteDialog
                open={deleteOpen}
                onClose={() => { setDeleteOpen(false) }}
                onClick={() => {
                    processTokens(() => { handleDeleteList(list.id) });
                }}
            />
        </Grid>
    );
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