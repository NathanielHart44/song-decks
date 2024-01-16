import {
    Grid,
    Typography,
    useTheme,
} from "@mui/material";
import ReactApexChart from 'react-apexcharts';
import { ChartDataCohort, ChartDataCohortGroup } from "src/@types/types";
import { capWords } from "src/utils/capWords";
import { fShortenNumber, fNumber } from "src/utils/formatNumber";

// ----------------------------------------------------------------------

type GraphAllSectionsProps = {
    single?: boolean,
    graph_groups: ChartDataCohortGroup[],
    grid_sizes: { xs: number; sm: number; md: number; lg: number; xl: number; }
};

export default function ApexLineGraphAllSections({ single, graph_groups, grid_sizes }: GraphAllSectionsProps) {

    return (
        <Grid container spacing={2} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
            { graph_groups.map((group, index) => {

                return (
                    <ApexLineGraphSection
                        key={'graph' + index}
                        single={single}
                        title={capWords(group.dataLabel)}
                        graph_group={group.data}
                        grid_sizes={grid_sizes}
                    />
                )
            })}
        </Grid>
    )
};

// ----------------------------------------------------------------------

type GraphSectionProps = {
    single?: boolean,
    title: string,
    graph_group: ChartDataCohort[],
    grid_sizes: { xs: number; sm: number; md: number; lg: number; xl: number; }
};

export function ApexLineGraphSection({ single, title, graph_group, grid_sizes }: GraphSectionProps) {

    if (single) {
        grid_sizes = { xs: 12, sm: 12, md: 10, lg: 10, xl: 8 };
    }

    return (
        <Grid item {...grid_sizes}>
            <Typography variant={'h6'}>{title}</Typography>
            <ApexLineGraph group_cohorts={graph_group} />
        </Grid>
    )
};

// ----------------------------------------------------------------------

type MomentumGraphProps = {
    group_cohorts: ChartDataCohort[],
};

export function ApexLineGraph({ group_cohorts }: MomentumGraphProps) {

    const theme = useTheme();
    
    const chartOptions = {
        colors: [theme.palette.primary.main, theme.palette.primary.lighter, theme.palette.primary.darker],
        stroke: { curve: "smooth" as "smooth" },
        noData: { text: 'Loading...' },
        theme: { mode: theme.palette.mode },
        chart: {
            background: 'transparent',
            toolbar: { show: false },
            sparkline: {
                enabled: false
                // set to true for a smaller, simpler chart
            },
            zoom: { enabled: false },
            stacked: false,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        },
        fill: {
            opacity: 1,
            // type: 'solid',
            colors: [theme.palette.primary.main, theme.palette.primary.lighter, theme.palette.primary.darker]
        },
        dataLabels: {
            enabled: false
            // set to true for the number to be present on the chart
        },
        grid: {
            position: 'front' as 'front',
            borderColor: theme.palette.text.secondary,
            xaxis: {
                lines: { show: false },
                tickPlacement: 'on' as 'on',
                labels: {
                    formatter: (value: number | string) => fShortenNumber(value),
                }
            },
        },
        legend: {
            show: true,
            position: 'top' as 'top',
            horizontalAlign: 'right' as 'right',
            floating: false,
        }
    };

    const series_data = group_cohorts.map((cohort) => {
        const sortedData = sortData(cohort);
        if (cohort.graphType === 'bar') {
            return {
                name: cohort.dataLabel,
                type: cohort.graphType,
                data: sortedData.map((value) => {
                    return value.value
                })
            }
        } else {
            const data = sortedData.map((value) => {
                return { x: value.date, y: value.value }
            });
            return {
                name: cohort.dataLabel,
                type: cohort.graphType || 'line',
                data: data
            }
        }
    });

    if (!series_data[0] || !series_data[0].data) return null;

    // const max_detailed_display = isMobile ? 1 : 20;
    const max_detailed_display = 1;
    const detailed_display = series_data[0].data.length <= max_detailed_display;

    return (
        <ReactApexChart
            series={series_data}
            options={{
                ...chartOptions,
                stroke: { width: series_data[0].type === 'line' ? 4 : 0},
                markers: { size: detailed_display ? 2 : 0 },
                yaxis: {
                    labels: { formatter: (value: number | string) => fNumber(value) },
                },
                xaxis: {
                    ...(series_data[0].type === 'bar' && { categories: sortData(group_cohorts[0]).map((value) => { return value.date }) }),
                    axisTicks: { show: false },
                    axisBorder: { show: false },
                    labels: { show: detailed_display ? true : false }
                },
                tooltip: {
                    x: { show: false },
                    y: {
                        formatter: (seriesName: number | string) => fNumber(seriesName),
                    },
                    marker: { show: false },
                }
            }}
        />
    )
}

// ----------------------------------------------------------------------

function sortData(cohort: ChartDataCohort) {
    const sortedData = [...cohort.data].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });
    return sortedData;
};