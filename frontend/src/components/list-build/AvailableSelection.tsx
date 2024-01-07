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
import { useContext, useState } from "react";
import { Attachment, NCU, Unit } from "src/@types/types";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import { MetadataContext } from "src/contexts/MetadataContext";
import { ListClickProps } from "../../pages/ListBuilder";

// ----------------------------------------------------------------------

type AvailableSelectionProps = {
    type: 'unit' | 'ncu' | 'attachment';
    index: number;
    item: Unit | Attachment | NCU;
    in_list: boolean;
    handleListClick: (props: ListClickProps) => void;
    handleOpenAttachments?: (unit: Unit) => void;
    gridItemStyles: SxProps<Theme>;
};

export function AvailableSelection({ type, index, item, in_list, handleListClick, handleOpenAttachments, gridItemStyles }: AvailableSelectionProps) {

    const theme = useTheme();
    const [viewedItem, setViewedItem] = useState<Unit | Attachment | NCU>(item);

    const { isMobile } = useContext(MetadataContext);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    let item_title = item.name;
    const contains_attachments = type === 'unit' && (item as Unit).attachments.length > 0;
    if (type === 'attachment') {
        item_title += ` (${(item as Attachment).attachment_type === 'commander' ? 'C' : item.points_cost})`;
    } else if (contains_attachments) {
        const total_points = (item as Unit).attachments.reduce((total, attachment) => total + attachment.points_cost, item.points_cost);
        item_title += ` (${total_points})`;
    } else {
        item_title += ` (${item.points_cost})`;
    };

    function getImgSizing() {
        let img_sizing: SxProps<Theme> = {
            maxHeight: '65%',
        };
        if (isMobile) {
            img_sizing = {
                maxHeight: '70%',
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
                        }}
                        onClick={event => event.stopPropagation()}
                    >
                        {contains_attachments && in_list &&
                            <ToggleButtonGroup
                                color="primary"
                                value={viewedItem.temp_id ? viewedItem.temp_id : viewedItem.id}
                                exclusive
                                size={'small'}
                                // fullWidth={!isMobile}
                                orientation={isMobile ? 'vertical' : 'horizontal'}
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
                        <Box sx={getImgSizing()}>
                            <img
                                src={viewedItem.main_url}
                                alt={viewedItem.name + ' main image'}
                                loading="lazy"
                                style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Box>
                        <Grid container columnGap={1} rowGap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <Grid item xs={5.5} md={4}>
                                <Button
                                    variant={'contained'}
                                    fullWidth
                                    onClick={() => { handleListClick({ type: getType(viewedItem), item: viewedItem, in_list, index }); setDialogOpen(false); setViewedItem(item); }}
                                >
                                    {in_list ? 'Remove' : 'Add'}
                                </Button>
                            </Grid>
                            <Grid item xs={5.5} md={4}>
                                <Button
                                    variant={'contained'}
                                    fullWidth
                                    onClick={() => { setDialogOpen(false); setViewedItem(item); }}
                                    color="secondary"
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            {type === 'unit' && in_list && handleOpenAttachments && getType(viewedItem) === 'unit' &&
                                <Grid item xs={12} md={8}>
                                    <Button
                                        variant={'contained'}
                                        fullWidth
                                        onClick={() => { handleOpenAttachments(item as Unit); setDialogOpen(false); }}
                                    >
                                        Add Attachment
                                    </Button>
                                </Grid>
                            }
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
            />
        </Grid>
    );
};
