import {
    Box,
    Button,
    Collapse,
    Grid,
    IconButton,
    TableCell,
    TableRow,
    Typography
} from "@mui/material";
import { useState } from "react";
import { Tag } from "src/@types/types";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import formatTimestamp from "src/utils/formatTimestamp";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";

// ----------------------------------------------------------------------

type TagLineType = {
    line_text_color: string;
    tag: Tag;
    handleTagEdit: (tag: Tag) => void;
};

export default function TagLine({ line_text_color, tag, handleTagEdit }: TagLineType) {

    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <TableRow
                key={'tag' + tag.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell component="th" scope="row" align={'left'}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align={'center'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {tag.name}
                    </Typography>
                </TableCell>
                <TableCell align={'center'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {tag.use_count}
                    </Typography>
                </TableCell>
                <TableCell align={'right'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {formatTimestamp(tag.created_at)}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, width: '100%' }}>
                            <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                    <Button
                                        variant={"contained"}
                                        onClick={() => { handleTagEdit(tag) }}
                                        fullWidth
                                    >
                                        Edit Tag
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};