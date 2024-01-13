import {
    IconButton,
    Input,
    InputAdornment,
    Stack
} from "@mui/material";
import Iconify from "./base/Iconify";

// ----------------------------------------------------------------------

type SearchbarProps = {
    searchTerm: string;
    setSearchTerm: (arg0: string) => void;
    width: string;
};
export function Searchbar({ searchTerm, setSearchTerm, width }: SearchbarProps) {

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
    }

    return (
        <Stack width={width} justifyContent={'center'} alignItems={'center'}>
            <Input
                fullWidth
                placeholder="Search…"
                startAdornment={
                    <InputAdornment position="start">
                        <Iconify
                            icon={'eva:search-fill'}
                            sx={{ color: 'text.disabled', width: 20, height: 20 }}
                        />
                    </InputAdornment>
                }
                endAdornment={
                    <>
                        {searchTerm.length > 0 &&
                            <InputAdornment position="end">
                                <IconButton onClick={() => setSearchTerm('')}>
                                    <Iconify
                                        icon={'eva:close-fill'}
                                        sx={{ color: 'text.disabled', width: 20, height: 20 }}
                                    />
                                </IconButton>
                            </InputAdornment>
                        }
                    </>
                }
                value={searchTerm}
                onChange={handleChange}
                sx={{ mr: 1, fontWeight: 'fontWeightBold' }} />
        </Stack>
    );
}
;
