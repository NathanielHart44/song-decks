import {
    Button,
    Grid,
} from "@mui/material";
import { useContext, useState } from "react";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Page from "src/components/base/Page";
import { MetadataContext } from "src/contexts/MetadataContext";
import ManageCardContent from "src/components/manage-content/ManageCardContent"
import KeywordSearch from "src/components/KeywordSearch";

// ----------------------------------------------------------------------

const contentOptions = ['cards', 'keywords'];
type ContentOptionType = typeof contentOptions[number];

// ----------------------------------------------------------------------

export default function ManageContent() {

    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [selectedContent, setSelectedContent] = useState<ContentOptionType | null>(null);

    return (
        <Page title="Manage Content">
            { awaitingResponse && <LoadingBackdrop /> }
            { selectedContent === 'cards' &&
                <ManageCardContent
                    isMobile={isMobile}
                    awaitingResponse={awaitingResponse}
                    setAwaitingResponse={setAwaitingResponse}
                />
            }
            { selectedContent === 'keywords' &&
                <KeywordSearch
                    is_game={false}
                    awaitingResponse={awaitingResponse}
                    setAwaitingResponse={setAwaitingResponse}
                />
            }
            { selectedContent === null &&
                <Grid container spacing={2} justifyContent={'center'} alignItems={'center'}>
                    {contentOptions.map((option) => (
                        <Grid key={option} item xs={8} md={4}>
                            <Button
                                fullWidth
                                size={"large"}
                                variant={'contained'}
                                onClick={() => setSelectedContent(option)}
                            >
                                {`Manage ${option}`}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            }
        </Page>
    );
};