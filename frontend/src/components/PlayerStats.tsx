import { Box, IconButton, Stack, Typography, keyframes, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { UserCardStats } from "src/@types/types";
import {
    VictoryBar,
    VictoryStack,
    VictoryLabel,
    VictoryLegend,
} from 'victory';
import Iconify from "./base/Iconify";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

type PlayerStatsProps = { stats: UserCardStats[] };
type CardStats = { id: number; card_name: string; times_included: number; times_drawn: number; times_discarded: number };

export function PlayerStats({ stats }: PlayerStatsProps) {

    const theme = useTheme();
    const { isMobile } = useContext(MetadataContext);

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

    const display_amt = 3;
    const formatted_stats: CardStats[] = stats.map((stat) => {
        return {
            id: stat.card_template.id,
            card_name: stat.card_template.card_name,
            times_included: stat.times_included,
            times_drawn: stat.times_drawn,
            times_discarded: stat.times_discarded,
        };
    });

    const [displayedStats, setDisplayedStats] = useState<CardStats[]>(formatted_stats.slice(0, display_amt));
    const [currentPage, setCurrentPage] = useState<number>(1);

    useEffect(() => {
        const initialDisplayedStats = formatted_stats.slice(0, display_amt);
        setDisplayedStats(initialDisplayedStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats]);

    const handleClick = () => {
        setCurrentPage((prevPage) => {
            const newPage = prevPage + 1;
            setDisplayedStats(formatted_stats.slice(0, newPage * display_amt));
            return newPage;
        });
    };

    const showLoadMoreButton = (currentPage * display_amt) < stats.length;

    const legendData = [
        { name: 'Discarded', symbol: { fill: theme.palette.primary.darker } },
        { name: 'Drawn', symbol: { fill: theme.palette.primary.light } },
        { name: 'Included', symbol: { fill: theme.palette.primary.main } }
    ];

    return (
        <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h4'} sx={{ mb: 2 }}>Card Stats</Typography>
            <Box position="relative" width={'100%'} height={'100%'}>
                <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    sx={{
                        zIndex: 1,
                        pointerEvents: "auto",
                        userSelect: "auto",
                        touchAction: "auto",
                        background: "transparent",
                    }}
                />
                <VictoryLegend
                    orientation={"horizontal"}
                    data={legendData}
                    gutter={{ left: isMobile ? 40 : 70, right: 20 }}
                    height={20}
                    style={{
                        labels: {
                            fill: theme.palette.text.primary,
                            fontFamily: theme.typography.fontFamily,
                            ...(!isMobile && { fontSize: 6 })
                        }
                    }}
                />
            </Box>

            <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                { displayedStats.map((stat) => (
                    <VStack
                        key={stat.id}
                        isMobile={isMobile}
                        stat={stat}
                    />
                ))}
            </Stack>

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

type CardStatsProps = {
    isMobile: boolean;
    stat: CardStats;
};

function VStack({ isMobile, stat }: CardStatsProps) {

    const theme = useTheme();
    const animation_duration = 1000;
    const bar_width = 25;

    function getFadeIn () {
        return keyframes({
            '0%': {
                opacity: 0,
            },
            '100%': {
                opacity: 1,
            },
        });
    };

    return (
        <Box sx={{ width: '100%', animation: `${getFadeIn()} 2s` }}>
            <Box position="relative">
                <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    sx={{
                        zIndex: 1,
                        pointerEvents: "auto",
                        userSelect: "auto",
                        touchAction: "auto",
                        background: "transparent",
                    }}
                />
                <VictoryStack height={70}>
                    <VictoryBar
                        horizontal
                        data={[stat]}
                        barWidth={bar_width}
                        x={"card_name"}
                        y={"times_discarded"}
                        labels={({ datum }) => datum.card_name}
                        cornerRadius={{ bottomLeft: 3, bottomRight: 3 }}
                        style={{
                            data: { fill: theme.palette.primary.darker },
                            labels: {
                                fill: theme.palette.text.primary,
                                fontFamily: theme.typography.fontFamily,
                                ...(!isMobile && { fontSize: 7 })
                            }
                        }}
                        labelComponent={ <VictoryLabel dy={-24} /> }
                        animate={{ onLoad: { duration: animation_duration }, onEnter: { duration: animation_duration } }}
                    />
                    <VictoryBar
                        horizontal
                        data={[stat]}
                        barWidth={bar_width}
                        x={"card_name"}
                        y={"times_drawn"}
                        cornerRadius={{
                            bottomLeft: ({ datum }) => (datum.times_discarded === 0 ? 3 : 0),
                            bottomRight: ({ datum }) => (datum.times_discarded === 0 ? 3 : 0),
                        }}
                        style={{
                            data: { fill: theme.palette.primary.light },
                        }}
                        animate={{ onLoad: { duration: animation_duration }, onEnter: { duration: animation_duration } }}
                    />
                    <VictoryBar
                        horizontal
                        data={[stat]}
                        barWidth={bar_width}
                        x={"card_name"}
                        y={"times_included"}
                        cornerRadius={{
                            topLeft: 3,
                            topRight: 3,
                            bottomLeft: ({ datum }) => ((datum.times_drawn === 0 && datum.times_discarded === 0) ? 3 : 0),
                            bottomRight: ({ datum }) => ((datum.times_drawn === 0 && datum.times_discarded === 0) ? 3 : 0),
                        }}
                        style={{
                            data: { fill: theme.palette.primary.main },
                        }}
                        animate={{ onLoad: { duration: animation_duration }, onEnter: { duration: animation_duration } }}
                    />
                </VictoryStack>
            </Box>
        </Box>
    )
};