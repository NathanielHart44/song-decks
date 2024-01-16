import {
    Accordion,
    AccordionDetails,
    Button,
    Dialog,
    DialogContent,
    Grid,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import AccordionSummaryDiv from "./workbench/AccordionSummaryDiv";
import { useContext, useEffect, useState } from "react";
import { KeywordPairType, KeywordType } from "src/@types/types";
import { objectToFormData, useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import AddNewWB from "./workbench/AddNewWB";
import { MetadataContext } from "src/contexts/MetadataContext";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";
import { TagDiv } from "./workbench/TagDisplay";
import { Searchbar } from "./Searchbar";
import { DeleteDialog } from "./base/DeleteDialog";

// ----------------------------------------------------------------------

const default_type: KeywordType = {
    id: -1,
    name: '',
    description: '',
};

const default_pair: KeywordPairType = {
    id: -1,
    keyword_types: [],
    keyword: '',
    description: '',
};

type ContentStateType = {
    setting: 'type' | 'pair';
    selected_type: KeywordType;
    used_types: KeywordType[];
    selected_pair: KeywordPairType;
    create_open: boolean;
    edit_open: boolean;
    delete_open: boolean;
};

const default_state: ContentStateType = {
    setting: 'pair',
    selected_type: default_type,
    used_types: [],
    selected_pair: default_pair,
    create_open: false,
    edit_open: false,
    delete_open: false,
};

// ----------------------------------------------------------------------

type Props = {
    is_game: boolean;
    awaitingResponse: boolean;
    setAwaitingResponse: (arg0: boolean) => void;
}

export default function KeywordSearch({ is_game, awaitingResponse, setAwaitingResponse }: Props) {

    const { isMobile } = useContext(MetadataContext);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [allTypes, setAllTypes] = useState<KeywordType[]>([default_type]);
    const [allPairs, setAllPairs] = useState<KeywordPairType[]>([]);
    
    const [contentState, setContentState] = useState<ContentStateType>(default_state);

    const { apiCall } = useApiCall();

    const getContent = async (type: 'types' | 'pairs') => {
        setAwaitingResponse(true);
        const url = type === 'types' ? 'get_keyword_types' : 'get_keyword_pairs';
        apiCall(url, 'GET', null, (data) => {
            if (type === 'types') { setAllTypes(data) };
            if (type === 'pairs') { setAllPairs(data) };
        });
    };

    useEffect(() => { processTokens(() => {
        getContent('types');
        getContent('pairs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    )}, []);

    useEffect(() => {
        if (allTypes && allPairs) { setAwaitingResponse(false) };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allTypes, allPairs]);

    const handleCreate = async (type: 'type' | 'pair', action: 'edit' | 'create') => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);
        let url = '';
        let formData = new FormData();
        if (action === 'edit') {
            url = type === 'type' ? `edit_keyword_type/${contentState.selected_type.id}` : `edit_keyword_pair/${contentState.selected_pair.id}`;
            formData = objectToFormData(type === 'type' ? contentState.selected_type : contentState.selected_pair);
        } else if (action === 'create') {
            url = type === 'type' ? 'create_keyword_type' : 'create_keyword_pair';
            formData = objectToFormData(type === 'type' ? contentState.selected_type : contentState.selected_pair);
        }
        apiCall(url, 'POST', formData, () => {
            processTokens(() => {
                getContent('types');
                getContent('pairs');
            });
            setContentState(default_state);
        });
        setAwaitingResponse(false);
    };

    const handleDelete = async (type: 'type' | 'pair', item: KeywordPairType | KeywordType) => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);
        apiCall(`delete_keyword_${type}/${item.id}`, 'DELETE', null, () => {
            processTokens(() => {
                getContent('types');
                getContent('pairs');
            });
        });
        setAwaitingResponse(false);
    };

    function handleEditStart(type: 'type' | 'pair', item: KeywordPairType | KeywordType) {
        if (type === 'type') { setContentState({ ...contentState, selected_type: item as KeywordType, edit_open: true }) };
        if (type === 'pair') { setContentState({ ...contentState, selected_pair: item as KeywordPairType, edit_open: true }) };
    };

    function handleDeleteStart(type: 'type' | 'pair', item: KeywordPairType | KeywordType) {
        if (type === 'type') { setContentState({ ...contentState, selected_type: item as KeywordType, delete_open: true }) };
        if (type === 'pair') { setContentState({ ...contentState, selected_pair: item as KeywordPairType, delete_open: true }) };
    };

    const filteredPairs = allPairs.filter((keyword_pair) => {
        const searchTermMatch = searchTerm ?
            keyword_pair.keyword.toLowerCase().includes(searchTerm.toLowerCase()) :
            true;
    
        const keywordTypeMatch = contentState.used_types.length > 0 ?
            keyword_pair.keyword_types.some(kt => contentState.used_types.map((t: KeywordType) => t.id).includes(kt.id)) :
            true;
    
        return searchTermMatch && keywordTypeMatch;
    });

    return (
        <Stack spacing={2} width={'100%'} height={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} width={'80%'} />
            <KeywordTypeDisplay
                is_main={true}
                view_only={is_game}
                allTypes={allTypes}
                contentState={contentState}
                setContentState={setContentState}
            />

            { filteredPairs.map((keyword_pair) => (
                <KeywordPair
                    key={keyword_pair.id}
                    keyword_pair={keyword_pair}
                    contentState={contentState}
                    onlySearched={filteredPairs.length === 1 ? true : false}
                    is_game={is_game}
                    handleEditStart={handleEditStart}
                    handleDeleteStart={handleDeleteStart}
                />
            ))}
            { !is_game &&
                <>
                    <AddNewWB
                        isMobile={isMobile}
                        handleClick={() => {
                            setContentState({
                                ...contentState,
                                selected_pair: default_pair,
                                create_open: true,
                                setting: 'pair'
                            });
                        }}
                    />
                    <CreationPair
                        is_new={contentState.create_open ? true :
                            contentState.edit_open ? false : false
                        }
                        allTypes={allTypes}
                        contentState={contentState}
                        setContentState={setContentState}
                        handleCreate={handleCreate}
                    />
                    <DeleteDialog
                        open={contentState.delete_open}
                        onClose={() => { setContentState({ ...contentState, delete_open: false }) }}
                        onClick={() => {
                            handleDelete('pair', contentState.selected_pair);
                            setContentState({
                                ...contentState,
                                delete_open: false
                            });
                        }}
                    />
                </>
            }

        </Stack>
    )
};

// ----------------------------------------------------------------------

type KeywordPairProps = {
    keyword_pair: KeywordPairType;
    contentState: ContentStateType;
    onlySearched: boolean;
    is_game: boolean;
    handleEditStart: (type: 'type' | 'pair', item: KeywordPairType | KeywordType) => void;
    handleDeleteStart: (type: 'type' | 'pair', item: KeywordPairType | KeywordType) => void;
};

function KeywordPair({ keyword_pair, contentState, onlySearched, is_game, handleEditStart, handleDeleteStart }: KeywordPairProps) {

    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);

    useEffect(() => {
        if (onlySearched) { setAccordionOpen(true) };
        if (!onlySearched) { setAccordionOpen(false) };
    }, [onlySearched]);

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
                    title={keyword_pair.keyword}
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    { keyword_pair.keyword_types.length > 0 &&
                        <KeywordTypeDisplay
                            is_main={false}
                            view_only={true}
                            allTypes={keyword_pair.keyword_types}
                            contentState={contentState}
                            setContentState={() => {}}
                        />
                    }
                    <Typography paragraph>{keyword_pair.description}</Typography>
                    { !is_game &&
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                <Button
                                    variant={"contained"}
                                    onClick={() => { handleEditStart('pair', keyword_pair) }}
                                    fullWidth
                                >
                                    Edit Keyword
                                </Button>
                            </Grid>
                            <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                <Button
                                    color={"secondary"}
                                    variant={"contained"}
                                    onClick={() => { handleDeleteStart('pair', keyword_pair) }}
                                    fullWidth
                                >
                                    Delete Keyword
                                </Button>
                            </Grid>
                        </Grid>
                    }
                </AccordionDetails>
            </Accordion>
        </Stack>
    )
};

// ----------------------------------------------------------------------

type CreationDialogProps = {
    is_new: boolean;
    allTypes: KeywordType[];
    contentState: ContentStateType;
    setContentState: (arg0: ContentStateType) => void;
    handleCreate: (type: 'type' | 'pair', action: 'edit' | 'create') => void;
};

function CreationPair({ is_new, allTypes, contentState, setContentState, handleCreate }: CreationDialogProps) {

    function handleCancel() {
        setContentState({
            ...contentState,
            selected_pair: default_pair,
            selected_type: default_type,
            used_types: [],
            create_open: false,
            edit_open: false
        });
    };

    const creating_pair = contentState.setting === 'pair';

    return (
        <Dialog
            open={is_new ? contentState.create_open : contentState.edit_open}
            fullWidth={true}
            onClose={handleCancel}
        >
            <DialogContent sx={{ p: 2 }}>
                <Stack spacing={2} width={'100%'}>
                    <TextField
                        label={creating_pair ? "Keyword" : "Name"}
                        variant={"outlined"}
                        value={creating_pair ? contentState.selected_pair?.keyword : contentState.selected_type?.name}
                        onChange={(event) => {
                            if (creating_pair) {
                                setContentState({ ...contentState, selected_pair: { ...contentState.selected_pair, keyword: event.target.value } });
                            } else {
                                setContentState({ ...contentState, selected_type: { ...contentState.selected_type, name: event.target.value } });
                            }
                        } }
                        fullWidth
                    />
                    <TextField
                        label={"Description"}
                        variant={"outlined"}
                        value={creating_pair ? contentState.selected_pair?.description : contentState.selected_type?.description}
                        onChange={(event) => {
                            if (creating_pair) {
                                setContentState({ ...contentState, selected_pair: { ...contentState.selected_pair, description: event.target.value } });
                            } else {
                                setContentState({ ...contentState, selected_type: { ...contentState.selected_type, description: event.target.value } });
                            }
                        } }
                        fullWidth
                        multiline
                        rows={4}
                    />
                    { creating_pair &&
                        <KeywordTypeDisplay
                            is_main={false}
                            view_only={false}
                            allTypes={allTypes}
                            contentState={contentState}
                            setContentState={setContentState}
                        />
                    }
                    <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                variant={"contained"}
                                onClick={() => {
                                    processTokens(() => {
                                        if (creating_pair) {
                                            handleCreate('pair', is_new ? 'create' : 'edit');
                                        } else {
                                            handleCreate('type', is_new ? 'create' : 'edit');
                                        }
                                    });
                                    setContentState({
                                        ...contentState,
                                        selected_pair: default_pair,
                                        selected_type: default_type,
                                        create_open: false,
                                        edit_open: false
                                    });
                                }}
                                fullWidth
                            >
                                {is_new ? `Create ${creating_pair ? 'Keyword' : 'Type'}` : `Edit ${creating_pair ? 'Keyword' : 'Type'}`}
                            </Button>
                        </Grid>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                color={"secondary"}
                                variant={"contained"}
                                onClick={handleCancel}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>
        </Dialog>
    )
};

// ----------------------------------------------------------------------

type KeywordTypeDisplayProps = {
    is_main: boolean;
    view_only: boolean;
    allTypes: KeywordType[];
    contentState: ContentStateType;
    setContentState: (arg0: ContentStateType) => void;
};

function KeywordTypeDisplay({ is_main, view_only, allTypes, contentState, setContentState }: KeywordTypeDisplayProps) {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const default_color = theme.palette.grey[500];

    function getTypeUsed(type: KeywordType) {
        if (is_main) {
            const all_used_types = contentState.used_types.map((t: KeywordType) => t.id);
            if (all_used_types.includes(type.id)) {
                return true;
            } else {
                return false;
            }
        } else {
            if (contentState.selected_pair.keyword_types.map((t: KeywordType) => t.id).includes(type.id)) {
                return true;
            } else {
                return false;
            }
        }
    };

    function handleClick(event: any, type: KeywordType) {
        event.stopPropagation();
        event.preventDefault();

        if (is_main) {
            if (getTypeUsed(type)) {
                setContentState({
                    ...contentState,
                    used_types: contentState.used_types.filter((t: KeywordType) => t.id !== type.id)
                });
            } else {
                setContentState({
                    ...contentState,
                    used_types: contentState.used_types.concat([type])
                });
            }
        } else {
            if (getTypeUsed(type)) {
                setContentState({
                    ...contentState,
                    selected_pair: { ...contentState.selected_pair, keyword_types: [] }
                });
            } else {
                setContentState({
                    ...contentState,
                    selected_pair: { ...contentState.selected_pair, keyword_types: contentState.selected_pair.keyword_types.concat([type]) }
                });
            }
        }

    };

    return (
        <>
            <Grid container spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                {allTypes.map((keyword_type: KeywordType) => (
                    <Grid key={'type_display_' + keyword_type.id} item>
                        <TagDiv
                            text={keyword_type.name}
                            handleClick={handleClick}
                            backgroundColor={getTypeUsed(keyword_type) ? theme.palette.primary.main : 'transparent'}
                            borderColor={getTypeUsed(keyword_type) ? 'transparent' : default_color}
                            textColor={getTypeUsed(keyword_type) ? 'white' : default_color}
                            item={keyword_type}
                        />
                    </Grid>
                ))}
            </Grid>
            { is_main && !view_only &&
                <AddNewWB
                    isMobile={isMobile}
                    handleClick={() => {
                        setContentState({
                            ...contentState,
                            selected_type: default_type,
                            create_open: true,
                            setting: 'type'
                        });
                    }}
                />
            }
        </>
    )
}