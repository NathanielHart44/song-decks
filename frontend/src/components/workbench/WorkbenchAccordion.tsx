import { ReactNode, useContext, useState } from "react";
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
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";

// ----------------------------------------------------------------------

type WorkbenchAccordionContainerType = {
    title: string;
    table_body: ReactNode | undefined;
    addNew?: () => void;
};

export default function WorkbenchAccordionContainer({ title, table_body, addNew }: WorkbenchAccordionContainerType) {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const label_color = theme.palette.text.secondary;

    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);

    let column_info: { id: string; label: string; align: string; }[] = [];
    if (title.includes('Proposals')) {
        column_info = WORKBENCH_SETTINGS.column_info.proposals;
    } else if (title.includes('Tasks')) {
        column_info = WORKBENCH_SETTINGS.column_info.tasks;
    } else if (title.includes('Tags')) {
        column_info = WORKBENCH_SETTINGS.column_info.tags;
    }

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
                expanded={accordionOpen}
                sx={{ ...(accordionOpen && { bgcolor: 'transparent' }) }}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummaryDiv accordionOpen={accordionOpen} setAccordionOpen={setAccordionOpen} title={title} />
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
                                        <TableCell colSpan={WORKBENCH_SETTINGS.column_info.proposals.length}>
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
    accordionOpen: boolean;
    setAccordionOpen: (isOpen: boolean) => void;
    title: string;
};

function AccordionSummaryDiv({ accordionOpen, setAccordionOpen, title }: AccordionSummaryDivType) {

    const theme = useTheme();

    const accordian_transition: string = '0.5s background-color;';
    const text_transition: string = '0.5s color;';
    const open_background_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    return (
        <AccordionSummary
            onClick={() => { setAccordionOpen(!accordionOpen) }}
            expandIcon={<ExpandMoreIcon />}
            sx={{
                borderRadius: '8px',
                transition: accordian_transition,
                color: theme.palette.text.secondary,
                ...(accordionOpen && { bgcolor: open_background_color }),
            }}
        >
            <Typography
                sx={{
                    transition: text_transition,
                    ...(accordionOpen && { color: theme.palette.primary.main })
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
function AddNew({ isMobile, handleClick }: AddNewProps) {

    const theme = useTheme();

    let card_sizing = isMobile ? 100 : 80;
    let icon_sizing = isMobile ? 50 : 40;
    const size_modifier = 1;
    card_sizing = card_sizing * size_modifier;
    icon_sizing = icon_sizing * size_modifier;

    return (
        <Card
            sx={{
                width: card_sizing,
                height: card_sizing,
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
                width={icon_sizing}
                height={icon_sizing}
            />
        </Card>
    );
};