import { ReactNode, useContext } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    alpha,
    useTheme
} from "@mui/material";
import Iconify from "src/components/base/Iconify";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MetadataContext } from "src/contexts/MetadataContext";
import { WORKBENCH_SETTINGS } from "src/utils/workbench_settings";

// ----------------------------------------------------------------------

type WorkbenchAccordionContainerType = {
    title: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    table_body: ReactNode | undefined;
    addNew?: () => void;
};

export default function WorkbenchAccordionContainer({ title, open, setOpen, table_body, addNew }: WorkbenchAccordionContainerType) {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const label_color = theme.palette.text.secondary;

    const column_info = WORKBENCH_SETTINGS.column_info[
        title === 'Proposals' ? 'proposals' : 'tasks' as keyof typeof WORKBENCH_SETTINGS.column_info
    ];

    const cell_sx = {
        color: label_color,
        backgroundColor: theme.palette.grey.default_canvas,
        '&:first-of-type': { boxShadow: 'none' },
        '&:last-of-type': { boxShadow: 'none' },
        backgroundImage: 'none'
    };

    return (
        <Stack width={'100%'}>
            <Accordion
                disableGutters={true}
                expanded={open}
                sx={{ ...(open && { bgcolor: 'transparent' }) }}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummaryDiv open={open} setOpen={setOpen} title={title} />
                <AccordionDetails sx={{ pt: 3 }}>
                    <TableContainer>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {column_info.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align as 'left' | 'center' | 'right'}
                                            sx={cell_sx}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody
                                sx={{
                                    '& > :nth-of-type(2n+1)': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                }}
                            >
                                {table_body}
                                { addNew &&
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Stack direction={'row'} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                                <AddNew isMobile={isMobile} handleClick={addNew} />
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );
}

// ----------------------------------------------------------------------

type AccordionSummaryDivType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
};

function AccordionSummaryDiv({ open, setOpen, title }: AccordionSummaryDivType) {

    const theme = useTheme();

    const accordian_transition: string = '0.5s background-color;';
    const text_transition: string = '0.5s color;';
    const open_background_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    return (
        <AccordionSummary
            onClick={() => { setOpen(!open) }}
            expandIcon={<ExpandMoreIcon />}
            sx={{
                borderRadius: '8px',
                transition: accordian_transition,
                color: theme.palette.text.secondary,
                ...(open && { bgcolor: open_background_color }),
            }}
        >
            <Typography
                sx={{
                    transition: text_transition,
                    ...(open && { color: theme.palette.primary.main })
                }}
            >
                {title}
            </Typography>
        </AccordionSummary>
    )
}

// ----------------------------------------------------------------------

type AddNewProps = {
    isMobile: boolean;
    handleClick: () => void;
};
export function AddNew({ isMobile, handleClick }: AddNewProps) {

    const theme = useTheme();

    return (
        <Card
            sx={{
                width: isMobile ? 100 : 80,
                height: isMobile ? 100 : 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...!isMobile ? {
                    transition: 'transform 0.3s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.1)' },
                } : {},
            }}
            onClick={handleClick}
        >
            <Iconify
                icon={'eva:plus-outline'}
                color={theme.palette.primary.main}
                width={isMobile ? 50 : 40}
                height={isMobile ? 50 : 40}
            />
        </Card>
    );
};