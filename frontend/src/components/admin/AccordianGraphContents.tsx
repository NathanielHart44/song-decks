import {
    AccordionDetails,
    Box,
    CircularProgress,
    Grid,
    MenuItem,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ChartData, ChartDataCohort, ChartDataCohortGroup } from 'src/@types/types';
import ApexLineGraphAllSections from 'src/components/graphs/ApexLineGraph';
import { processTokens } from 'src/utils/jwt';
import { capWords } from 'src/utils/capWords';
import Iconify from 'src/components/base/Iconify';
import { default_chart_data_groups } from 'src/pages/AdminPage';
import { useApiCall } from 'src/hooks/useApiCall';

// ----------------------------------------------------------------------

type AccordianGraphContentsProps = {
    base_url: string;
    chartDataGroups: ChartDataCohortGroup[];
    setChartDataGroups: React.Dispatch<React.SetStateAction<ChartDataCohortGroup[]>>;
};

// ----------------------------------------------------------------------

export function AccordianGraphContents({ base_url, chartDataGroups, setChartDataGroups }: AccordianGraphContentsProps) {

    const grid_sizes = { xs: 12, sm: 12, md: 6, lg: 6, xl: 6 };
    const days_range = [7, 10, 14, 30, 90, 365];
    const { apiCall } = useApiCall();
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [daysCount, setDaysCount] = useState<number>(10);
    const [alignment, setAlignment] = useState<'vertical' | 'grid'>('vertical');

    const getInfo = async (is_cumulative: boolean, url_base: string) => {
        setAwaitingResponse(true);
        const url = `${url_base}/${daysCount}/${is_cumulative ? 'true' : 'false'}`;
        apiCall(url, 'GET', null, (data) => {
            let chart_data_group: ChartDataCohort[] = [];

            for (const type in data) {
                const chart_data: ChartData[] = data[type];
                const formatted_data: ChartDataCohort = {
                    data: chart_data,
                    dataLabel: capWords(type),
                    graphType: is_cumulative ? 'line' : 'bar'
                };
                chart_data_group.push(formatted_data);
            }

            let new_group: ChartDataCohortGroup = {
                data: chart_data_group,
                dataLabel: is_cumulative ? 'cumulative' : 'day_by_day',
            };
            setChartDataGroups((chartDataGroups) => chartDataGroups.filter((group) => group.dataLabel !== new_group.dataLabel).concat(new_group));
        });
        setAwaitingResponse(false);
    };

    useEffect(() => {
        setChartDataGroups(default_chart_data_groups);
        processTokens(() => {
            getInfo(true, base_url);
            getInfo(false, base_url);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [daysCount]);

    return (
        <AccordionDetails sx={{ pt: 3 }}>
            <Grid
                container
                spacing={2}
                alignItems={'center'}
                justifyContent={'center'}
                sx={{ width: '100%' }}
            >
                <Grid item {...grid_sizes}>
                    <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
                        <Typography>Days</Typography>
                        <Select size={'small'} value={daysCount.toString()} onChange={(e) => { setDaysCount(parseInt(e.target.value)) }}>
                            {days_range.map((number) => (
                                <MenuItem key={'days' + number} value={number.toString()}>{number}</MenuItem>
                            ))}
                        </Select>
                    </Stack>
                </Grid>
                <Grid item {...grid_sizes}>
                    <Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
                        <Typography>Alignment</Typography>
                        <ToggleButtonGroup
                            color="primary"
                            value={alignment}
                            exclusive
                            size={'small'}
                        >
                            <ToggleButton value={'vertical'} onClick={() => { setAlignment('vertical'); }}>
                                <Iconify icon={'eva:menu-fill'} width={20} height={20} />
                            </ToggleButton>
                            <ToggleButton value={'grid'} onClick={() => { setAlignment('grid'); }}>
                                <Iconify icon={'eva:grid-fill'} width={20} height={20} />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Grid>
            </Grid>
            {awaitingResponse &&
                <Stack sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                    </Box>
                </Stack>
            }
            {!awaitingResponse &&
                <ApexLineGraphAllSections
                    single={alignment === 'vertical' || chartDataGroups.length === 1}
                    graph_groups={chartDataGroups}
                    grid_sizes={grid_sizes}
                />
            }
        </AccordionDetails>
    );
};
