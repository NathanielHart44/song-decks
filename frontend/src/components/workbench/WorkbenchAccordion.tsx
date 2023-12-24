import { ReactNode, useContext, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    alpha,
    useTheme
} from "@mui/material";
import { MetadataContext } from "src/contexts/MetadataContext";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";
import AccordionSummaryDiv from "./AccordionSummaryDiv";
import AddNewWB from "./AddNewWB";

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
                                                <AddNewWB isMobile={isMobile} handleClick={addNew} />
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