/* eslint-disable react-hooks/exhaustive-deps */
import { Accordion, AccordionDetails, Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Page from "src/components/base/Page";
import { useApiCall } from "src/hooks/useApiCall";
import { List, FakeList } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import { MetadataContext } from "src/contexts/MetadataContext";
import AddNewWB from "src/components/workbench/AddNewWB";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "src/routes/paths";
import AccordionSummaryDiv from "src/components/workbench/AccordionSummaryDiv";

// ----------------------------------------------------------------------

export default function ListManager() {

    const navigate = useNavigate();
    const { apiCall } = useApiCall();
    const { isMobile } = useContext(MetadataContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [currentLists, setCurrentLists] = useState<List[]>();

    const getLists = async (type: 'all' | 'player') => {
        setAwaitingResponse(true);
        let url = 'lists';
        apiCall(url, 'GET', null, (data: FakeList[]) => {

            let new_data: any[] = [];
            data.forEach((list: FakeList) => {
                let new_list: any = {};
                new_list.id = list.id;
                new_list.name = list.name;
                new_list.owner = list.owner;
                new_list.points_allowed = list.points_allowed;
                new_list.faction = list.faction;
                new_list.commander = list.commander;
                new_list.units = list.units.map((listUnitObj) => {
                    let unit = listUnitObj.unit;
                    unit.attachments = listUnitObj.attachments;
            
                    return unit;
                });
                new_list.ncus = list.ncus.map((ncuObj) => { return ncuObj.ncu });
                new_list.created_at = list.created_at;
                new_list.updated_at = list.updated_at;
                new_list.is_draft = list.is_draft;
                new_list.is_public = list.is_public;
                new_list.is_valid = list.is_valid;
                new_list.shared_from = list.shared_from;
                new_data.push(new_list);
            });

            setCurrentLists(new_data);
        });
    };

    useEffect(() => {
        processTokens(() => {
            getLists('all');
        })
    }, []);

    useEffect(() => {
        if (currentLists) {
            setAwaitingResponse(false);
        };
    }, [currentLists]);

    return (
        <Page title="List Manager">
            {awaitingResponse && <LoadingBackdrop />}
            <Container maxWidth={false}>
                <Stack justifyContent={'center'} alignItems={'center'} spacing={2} width={'100%'}>
                    <AddNewWB
                        isMobile={isMobile}
                        handleClick={() => { navigate(PATH_PAGE.list_builder) }}
                    />
                    {currentLists && currentLists.map((list, index) => (
                        <ListDisplay
                            key={index}
                            list={list}
                        />
                    ))}
                </Stack>
            </Container>
        </Page>
    )
};

// ----------------------------------------------------------------------

type ListDisplayProps = {
    list: List;
};

function ListDisplay({ list }: ListDisplayProps) {

    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);

    const unit_count = list.units.length;
    const ncu_count = list.ncus.length;

    return (
        <Stack sx={{ width: '85%' }}>
            <Accordion
                disableGutters={true}
                expanded={accordionOpen}
                sx={{ ...(accordionOpen && { bgcolor: 'transparent' }) }}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummaryDiv
                    accordionOpen={accordionOpen}
                    setAccordionOpen={setAccordionOpen}
                    title={list.name + ` - (${unit_count} units, ${ncu_count} NCUs)`}
                    icon={
                        <Stack direction={'row'} spacing={1}>
                            <Box sx={{ maxHeight: '100%', maxWidth: '34px' }}>
                                <img alt={list.faction.name + ' icon'} src={list.faction.img_url}/>
                            </Box>
                            <Box sx={{ maxHeight: '100%', maxWidth: '34px' }}>
                                <img
                                    alt={list.commander.name + ' icon'}
                                    src={list.commander.img_url}
                                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </Box>
                        </Stack>
                    }
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                        <Typography variant={'h6'}>
                            Units
                        </Typography>
                        <Divider sx={{ width: '65%' }} />
                        {list.units.map((unit, index) => (
                            <Typography key={index} variant={'body1'}>
                                {unit.name} ({unit.points_cost}{unit.attachments.length > 0 && ` + ${unit.attachments.map((attachment) => attachment.points_cost).reduce((a, b) => a + b)}`})
                            </Typography>
                        ))}
                    </Stack>
                    <Stack width={'100%'} direction={'row'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                        <Button
                            variant={'contained'}
                            onClick={() => { }}
                            fullWidth
                        >
                            Edit
                        </Button>
                        <Button
                            variant={'contained'}
                            onClick={() => { }}
                            fullWidth
                            color={'secondary'}
                        >
                            Delete
                        </Button>
                        {/* add copy link and share? */}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Stack>
    )
};