import { Button, Card, Container, Stack, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactPop from "src/components/ContactPop";
import Page from "src/components/base/Page";
import { PATH_PAGE } from "src/routes/paths";

// ----------------------------------------------------------------------

export default function TesterPage() {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];

    const items = [
        {
            title: "Website App",
            description: "Looking to figure out all bugs and issues with the website app.",
            link: `${PATH_PAGE.home}`
        },
    ]

    return (
        <Page title="Testers">
            <Container maxWidth={'sm'}>
                <Stack spacing={3} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                    {items.map((item, index) => (
                        <ListItemCont
                            key={index}
                            title={item.title}
                            description={item.description}
                            link={item.link}
                            text_color={title_grey}
                        />
                    ))}
                </Stack>
            </Container>
        </Page>
    )
}

// ----------------------------------------------------------------------

type ListItemContProps = {
    title: string;
    description: string;
    link: string;
    text_color: string;
};

function ListItemCont({ title, description, link, text_color }: ListItemContProps) {

    const navigate = useNavigate();

    const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);

    const handleFeedback = () => { setFeedbackOpen(!feedbackOpen) };

    return (
        <Card sx={{ p: 2, width: '100%' }}>
            <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h6'}>{title}</Typography>
                <Typography variant={'subtitle2'} color={text_color} paragraph sx={{ textAlign: 'center', mb: 0 }}>
                    {description}
                </Typography>
                <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                    {link !== "" &&
                        <Button
                            variant={'contained'}
                            onClick={() => { navigate(link) }}
                            fullWidth
                        >
                            Try Out
                        </Button>
                    }
                    <Button
                        variant={'outlined'}
                        onClick={handleFeedback}
                        fullWidth
                    >
                        Feedback
                    </Button>
                </Stack>
            </Stack>
            <ContactPop
                popOpen={feedbackOpen}
                setPopOpen={setFeedbackOpen}
            />
        </Card>
    )
};
