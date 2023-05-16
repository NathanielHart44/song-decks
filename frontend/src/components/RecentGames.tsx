import {
    Button,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    alpha,
    keyframes,
    useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import { Game } from "src/@types/types";
import Iconify from "src/components/Iconify";

// ----------------------------------------------------------------------

type RecentGameProps = {
    isMobile: boolean;
    games: Game[];
};

export function RecentGames({ isMobile, games }: RecentGameProps) {
    const display_amt = 5;
    const [displayedGames, setDisplayedGames] = useState<Game[]>(games.slice(0, display_amt));
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const initialDisplayedGames = games.slice(0, display_amt);
        setDisplayedGames(initialDisplayedGames);
    }, [games]);

    const theme = useTheme();
    const bg_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    function getPulse() {
        return keyframes({
            '0%': {
                transform: 'scale(0.95)',
                opacity: 1,
            },
            '50%': {
                transform: 'scale(1.05)',
                opacity: 0.65,
            },
            '100%': {
                transform: 'scale(0.95)',
                opacity: 1,
            },
        });
    };

    const handleClick = () => {
        setCurrentPage(currentPage + 1);
        setDisplayedGames(games.slice(0, (currentPage + 1) * display_amt));
    };

    const showLoadMoreButton = (currentPage * display_amt) < games.length;

    return (
        <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h6'}>Recent Games</Typography>
            <TableContainer>
                <Table size={'small'} stickyHeader>
                    <TableBody sx={{ '& > :nth-of-type(2n+2)': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                        { displayedGames.map((game) => (
                            <TableRow
                                key={game.id}
                                sx={{ transition: '0.25s background-color;', '&:hover': { bgcolor: bg_color } }}
                            >
                                { isMobile ?
                                    <TableCell component="th" scope="row" align="center">{game.commander.name}</TableCell> :
                                    <TableCell component="th" scope="row" align="center">{game.faction.name}</TableCell> }
                                { !isMobile && <TableCell align="center">{game.commander.name}</TableCell> }
                                {/* <TableCell align="center">
                                    <Button variant="contained" disabled={true}>Resume Game</Button>
                                </TableCell> */}
                                <TableCell align="center">Round: {game.round}</TableCell>
                                <TableCell align="center">
                                    <Button variant="contained" disabled={game.status === 'in-progress' ? false : true}>End Game</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            { showLoadMoreButton &&
                <IconButton
                    size="large"
                    color="inherit"
                    onClick={handleClick}
                >
                    <Iconify
                        icon={'eva:arrow-ios-downward-outline'}
                        width={30}
                        height={30}
                        color={theme.palette.primary.main}
                        sx={{ animation: `${getPulse()} 2s ease-in-out infinite` }}
                    />
                </IconButton>
            }
        </Stack>
    );
};