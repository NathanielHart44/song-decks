import { IconButton, Stack, Typography, keyframes, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { UserCardStats } from "src/@types/types";
import {
    VictoryBar,
    VictoryStack,
    VictoryLabel,
    VictoryLegend,
    VictoryGroup,
    VictoryContainer,
    VictoryAnimation
} from 'victory';
import Iconify from "./Iconify";

// ----------------------------------------------------------------------

type PlayerStatsProps = { stats: UserCardStats[] };
type CardStats = { id: number; card_name: string; times_included: number; times_drawn: number; times_discarded: number };

export function PlayerStats({ stats }: PlayerStatsProps) {

    const theme = useTheme();

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

    const display_amt = 2;
    const bar_width = 25;
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
        const initialDisplayedStats = formatted_stats.slice(0, display_amt).map((stat) => ({
            ...stat,
            x: -100
        }));
        setDisplayedStats(initialDisplayedStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats]);

    const handleClick = () => {
        setCurrentPage(currentPage + 1);
        setDisplayedStats(formatted_stats.slice(0, (currentPage + 1) * display_amt));
    };

    const showLoadMoreButton = (currentPage * display_amt) < stats.length;

    const legendData = [
        { name: 'Discarded', symbol: { fill: theme.palette.primary.darker } },
        { name: 'Drawn', symbol: { fill: theme.palette.primary.light } },
        { name: 'Included', symbol: { fill: theme.palette.primary.main } }
    ];

    return (
        <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h6'}>Card Stats</Typography>
            <VictoryLegend
                orientation={"horizontal"}
                data={legendData}
                gutter={{ left: 40, right: 20 }}
                height={20}
                style={{
                    labels: {
                        fill: theme.palette.text.primary,
                        fontFamily: theme.typography.fontFamily,
                    }
                }}
            />
            <VictoryGroup
                height={displayedStats.length * 100}
                containerComponent={
                    <VictoryContainer
                        style={{
                            pointerEvents: "auto",
                            userSelect: "auto",
                            touchAction: "auto"
                        }}
                    />
                }
            >
                <VictoryStack>
                    <VictoryBar
                        horizontal
                        data={displayedStats}
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
                            }
                        }}
                        labelComponent={ <VictoryLabel dy={-24} /> }
                    />
                    <VictoryBar
                        horizontal
                        data={displayedStats}
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
                    />
                    <VictoryBar
                        horizontal
                        data={displayedStats}
                        barWidth={bar_width}
                        x={"card_name"}
                        y={"times_included"}
                        cornerRadius={{ topLeft: 3, topRight: 3 }}
                        style={{
                            data: { fill: theme.palette.primary.main },
                        }}
                    />
                </VictoryStack>
            </VictoryGroup>
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
