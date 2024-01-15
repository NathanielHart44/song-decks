import { Grid, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { List } from "src/@types/types";
import { ListDisplay } from "./ListDisplay";

// ----------------------------------------------------------------------

type CurrentListsDisplayType = {
    type: 'manage' | 'select';
    currentLists: List[] | undefined;
    selectedList?: List | null;
    selectList?: (list: List | null) => void;
};

export function CurrentListsDisplay({ type, currentLists, selectedList, selectList }: CurrentListsDisplayType) {

    const theme = useTheme();

    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fill, 320px)',
        gridAutoRows: '260px',
        gap: '16px'
    };

    function sortListsByDate(lists: List[]) {
        return lists.sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
    }

    return (
        <>
            {selectedList &&
                <ListDisplay
                    type={type}
                    list={selectedList}
                    selectedList={selectedList}
                    selectList={selectList}
                />
            }
            <Grid container sx={gridContainerStyles}>
                {currentLists && !selectedList && sortListsByDate(currentLists).map((list, index) => (
                    <ListDisplay
                        key={index}
                        type={type}
                        list={list}
                        selectedList={selectedList}
                        selectList={selectList}
                    />
                ))}
            </Grid>
            {currentLists && currentLists.length === 0 &&
                <Typography color={theme.palette.text.disabled}>No Lists Created</Typography>
            }
        </>
    );
}
