import {
    AccordionSummary, Stack, Typography,
    alpha,
    useTheme
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ----------------------------------------------------------------------

type AccordionSummaryDivType = {
    accordionOpen: boolean;
    setAccordionOpen: (isOpen: boolean) => void;
    title: string;
    icon?: JSX.Element;
    disabled?: boolean;
};
export default function AccordionSummaryDiv({ accordionOpen, setAccordionOpen, title, icon, disabled }: AccordionSummaryDivType) {

    const theme = useTheme();

    const accordian_transition: string = '0.5s background-color;';
    const text_transition: string = '0.5s color;';
    const open_background_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    return (
        <AccordionSummary
            onClick={() => { setAccordionOpen(!accordionOpen); }}
            expandIcon={<ExpandMoreIcon />}
            sx={{
                borderRadius: '8px',
                transition: accordian_transition,
                color: theme.palette.text.secondary,
                ...(accordionOpen && { bgcolor: open_background_color }),
            }}
            disabled={disabled}
        >
            <Stack direction="row" alignItems="flex-start" spacing={1}>
                {icon}
                <Typography
                    sx={{
                        transition: text_transition,
                        ...(accordionOpen && { color: theme.palette.primary.main })
                    }}
                >
                    {title}
                </Typography>
            </Stack>
        </AccordionSummary>
    );
}
