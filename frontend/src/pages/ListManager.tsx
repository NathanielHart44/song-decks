/* eslint-disable react-hooks/exhaustive-deps */
import { Container, Stack, Typography } from "@mui/material";
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
import { CurrentListsDisplay } from "../components/list-manage/CurrentListsDisplay";
import { Searchbar } from "src/components/Searchbar";

// ----------------------------------------------------------------------

export default function ListManager() {

    const navigate = useNavigate();
    const { apiCall } = useApiCall();
    const { isMobile, currentUser } = useContext(MetadataContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [currentLists, setCurrentLists] = useState<List[]>();
    const [viewedLists, setViewedLists] = useState<List[]>([]); // used for filters
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getLists = async (type: 'all' | 'player') => {
        setAwaitingResponse(true);
        let url = 'lists';
        if (type === 'player') {
            url += `/${currentUser?.id}`;
        }
        apiCall(url, 'GET', null, (data: FakeList[]) => {

            let new_data: List[] = parseLists(data);

            setCurrentLists(new_data);
        });
    };

    useEffect(() => {
        processTokens(() => {
            getLists('player');
        })
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filteredLists = currentLists?.filter((list) => {
                return list.faction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    list.commander.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    list.name.toLowerCase().includes(searchTerm.toLowerCase());
            }) ?? [];
            setViewedLists(filteredLists);
        } else {
            setViewedLists(currentLists ?? []);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (currentLists) {
            setAwaitingResponse(false);
            setViewedLists(currentLists);
        };
    }, [currentLists]);

    return (
        <Page title="List Manager">
            {awaitingResponse && <LoadingBackdrop />}
            <Container maxWidth={false}>
                <Stack justifyContent={'center'} alignItems={'center'} spacing={2} width={'100%'}>
                    <Typography variant={'h3'}>List Manager</Typography>
                    <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} width={'80%'} />
                    <AddNewWB
                        isMobile={isMobile}
                        handleClick={() => { navigate(PATH_PAGE.list_builder) }}
                    />
                    <CurrentListsDisplay type={'manage'} currentLists={viewedLists} />
                </Stack>
            </Container>
        </Page>
    )
};

// ----------------------------------------------------------------------

export function parseLists(data: FakeList[]) {
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
        new_list.ncus = list.ncus.map((ncuObj) => { return ncuObj.ncu; });
        new_list.created_at = list.created_at;
        new_list.updated_at = list.updated_at;
        new_list.is_draft = list.is_draft;
        new_list.is_public = list.is_public;
        new_list.is_valid = list.is_valid;
        new_list.shared_from = list.shared_from;
        new_data.push(new_list);
    });
    return new_data;
}
