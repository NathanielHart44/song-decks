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
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Game } from "src/@types/types";
import Iconify from "src/components/base/Iconify";
import { MAIN_API } from "src/config";
import { processTokens } from "src/utils/jwt";

// ----------------------------------------------------------------------

type RecentGameProps = {
    isMobile: boolean;
    games: Game[];
};

export function RecentGames({ isMobile, games }: RecentGameProps) {

    const theme = useTheme();
    const display_amt = 5;
    const [displayedGames, setDisplayedGames] = useState<Game[]>(games.slice(0, display_amt));
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const initialDisplayedGames = games.slice(0, display_amt);
        setDisplayedGames(initialDisplayedGames);
    }, [games]);

    function getPulse() {
        return keyframes({
            '0%': {
                transform: 'scale(0.9)',
                opacity: 1,
            },
            '50%': {
                transform: 'scale(1.1)',
                opacity: 0.65,
            },
            '100%': {
                transform: 'scale(0.9)',
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
            <Typography variant={'h4'}>Recent Games</Typography>
            <TableContainer>
                <Table size={'small'} stickyHeader>
                    <TableBody sx={{ '& > :nth-of-type(2n+2)': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                        { displayedGames.map((game) => (
                            <GameRow
                                key={game.id}
                                game={game}
                                isMobile={isMobile}
                            />
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

// ----------------------------------------------------------------------

type GameRowProps = {
    game: Game;
    isMobile: boolean;
};

function GameRow({ game, isMobile }: GameRowProps) {

    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const bg_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    const [ended, setEnded] = useState<boolean>(false);

    const endGame = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}end_game/${(game.id).toString()}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                enqueueSnackbar(res);
                game.status = 'completed';
                setEnded(true);
            } else {
                enqueueSnackbar(response.data.response);
            };
        }).catch((error) => {
            console.error(error);
        })
    };

    return (
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
                <Button
                    variant="contained"
                    disabled={(!ended && game.status === 'in-progress') ? false : true}
                    onClick={() => processTokens(endGame)}
                >
                    End Game
                </Button>
            </TableCell>
        </TableRow>
    );
};