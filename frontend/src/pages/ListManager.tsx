/* eslint-disable react-hooks/exhaustive-deps */
import { Container, Grid, Stack, SxProps, Theme } from "@mui/material";
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
import { ListDisplay } from "../components/list-manage/ListDisplay";

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

    function sortListsByDate(lists: List[]) {
        return lists.sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
    }

    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fill, 320px)',
        gap: '16px'
    };

    return (
        <Page title="List Manager">
            {awaitingResponse && <LoadingBackdrop />}
            <Container maxWidth={false}>
                <Stack justifyContent={'center'} alignItems={'center'} spacing={2} width={'100%'}>
                    <AddNewWB
                        isMobile={isMobile}
                        handleClick={() => { navigate(PATH_PAGE.list_builder) }}
                    />

                    <Grid container sx={gridContainerStyles}>
                        {currentLists && sortListsByDate(currentLists).map((list, index) => (
                            <ListDisplay
                                key={index}
                                list={list}
                            />
                        ))}
                    </Grid>
                </Stack>
            </Container>
        </Page>
    )
};