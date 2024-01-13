import {
    Box,
    Grid,
    Stack,
    SxProps,
    Theme,
    Dialog,
    useTheme,
    Button,
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Attachment, NCU, Unit } from "src/@types/types";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import { MetadataContext } from "src/contexts/MetadataContext";
import { ListClickProps } from "../../pages/ListBuilder";

// ----------------------------------------------------------------------

type AvailableSelectionProps = {
    type: 'unit' | 'ncu' | 'attachment';
    index: number;
    item: Unit | Attachment | NCU;
    disabledItems: Unit[] | NCU[] | null;
    in_list: boolean;
    handleListClick: (props: ListClickProps) => void;
    handleOpenAttachments?: (unit: Unit) => void;
    gridItemStyles: SxProps<Theme>;
    attachment_select?: boolean;
    testing?: boolean;
};

export function AvailableSelection({ type, index, item, disabledItems, in_list, handleListClick, handleOpenAttachments, gridItemStyles, attachment_select, testing }: AvailableSelectionProps) {

    const theme = useTheme();
    const [viewedItem, setViewedItem] = useState<Unit | Attachment | NCU>(item);
    const { isMobile } = useContext(MetadataContext);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        if (dialogOpen) {
            setViewedItem(item);
        };
    }, [item, dialogOpen]);

    const is_disabled = disabledItems ?
        (type === 'unit' ?
            disabledItems.some(disabled_item => (disabled_item.temp_id === item.temp_id || disabled_item.id === item.id)) :
            disabledItems.some(disabled_item => (disabled_item.id === item.id))
        ) : false;

    let item_title = item.name;
    if (testing) {
        item_title += ` ${item.temp_id === undefined ? item.id : item.temp_id}`;
    }
    const contains_attachments = type === 'unit' && (item as Unit).attachments.length > 0;
    if (type === 'attachment') {
        item_title += ` (${(item as Attachment).attachment_type === 'commander' ? 'C' : item.points_cost})`;
    } else if (contains_attachments) {
        const includes_commander = (item as Unit).attachments.some(attachment => attachment.attachment_type === 'commander');
        if (includes_commander) {
            item_title = '(C) ' + item_title + ` (${item.points_cost})`;
        };
        const non_commander_attachments = (item as Unit).attachments.filter(attachment => attachment.attachment_type !== 'commander');
        if (non_commander_attachments.length > 0) {
            const total_attachment_points = (item as Unit).attachments.reduce((total, attachment) => total + attachment.points_cost, 0);
            item_title += ` (${item.points_cost}+${total_attachment_points})`;
        };
    } else {
        item_title += ` (${item.points_cost})`;
    };

    function getImgSizing() {
        let img_sizing: SxProps<Theme> = {
            maxHeight: '65%'
        };
        if (isMobile) {
            img_sizing = {
                maxHeight: '70%'
            };
        };
        return img_sizing;
    };

    function getType(viewed_item: Unit | Attachment | NCU) {
        if (type !== 'unit') {
            return type;
        } else {
            if (viewed_item.temp_id === item.temp_id) {
                return 'unit';
            } else {
                return 'attachment';
            }
        }
    };

    return (
        <Grid item sx={gridItemStyles}>
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
                onClick={() => setDialogOpen(false)}
            >
                <Stack justifyContent={'center'} alignItems={'center'} sx={{ width: '100%' }}>
                    <Stack
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                            height: '100vh',
                            width: '95%',
                            padding: isMobile ? 2 : 4,
                            zIndex: (theme) => theme.zIndex.drawer + 2,
                        }}
                    >
                        {contains_attachments && in_list &&
                            <ToggleButtonGroup
                                color="primary"
                                value={viewedItem.temp_id ? viewedItem.temp_id : viewedItem.id}
                                exclusive
                                size={'small'}
                                fullWidth={!isMobile}
                                orientation={isMobile ? 'vertical' : 'horizontal'}
                                onClick={event => event.stopPropagation()}
                            >
                                <ToggleButton value={item.temp_id ? item.temp_id : item.id} onClick={() => { setViewedItem(item); }}>
                                    {item.name} ({item.points_cost})
                                </ToggleButton>
                                {(item as Unit).attachments.map((attachment, attach_index) => (
                                    <ToggleButton
                                        key={attachment.name + '_toggle_' + attach_index}
                                        value={attachment.temp_id ? attachment.temp_id : attachment.id}
                                        onClick={() => { setViewedItem(attachment); }}
                                    >
                                        {attachment.name} ({attachment.attachment_type === 'commander' ? 'C' : attachment.points_cost})
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        }
                        <Box sx={getImgSizing()} onClick={event => event.stopPropagation()}>
                            <img
                                src={viewedItem.main_url}
                                alt={viewedItem.name + ' main image'}
                                loading="lazy"
                                style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </Box>
                        <Grid
                            container
                            columnGap={1}
                            rowGap={2}
                            width={'100%'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            onClick={event => event.stopPropagation()}
                        >
                            {type === 'unit' && in_list && handleOpenAttachments && getType(viewedItem) === 'unit' &&
                                <Grid item xs={5.5} md={4}>
                                    <Button
                                        variant={'contained'}
                                        fullWidth
                                        onClick={() => { handleOpenAttachments(item as Unit); setDialogOpen(false); }}
                                    >
                                        Add Attachment
                                    </Button>
                                </Grid>
                            }
                            <Grid item xs={5.5} md={4}>
                                <Button
                                    variant={'contained'}
                                    fullWidth
                                    disabled={is_disabled}
                                    color={attachment_select || in_list ? 'secondary' : 'primary'}
                                    onClick={() => { setViewedItem(item); handleListClick({ type: getType(viewedItem), item: viewedItem, in_list: in_list, index }); setDialogOpen(false); setViewedItem(item); }}
                                >
                                    {attachment_select ? 'Unselect' : (in_list ? 'Remove' : 'Add')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Stack>
                </Stack>
            </Dialog>
            <SelectableAvatar
                item={item}
                altText={item_title}
                isMobile={false}
                handleClick={() => { setDialogOpen(true); }}
                attachments={type === 'unit' ? (item as Unit).attachments : undefined}
                disabled={is_disabled}
            />
        </Grid>
    );
};
