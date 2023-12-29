/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { Faction } from 'src/@types/types';
import { useApiCall } from 'src/hooks/useApiCall';
import { processTokens } from 'src/utils/jwt';

const useFactions = () => {
    const [allFactions, setAllFactions] = useState<Faction[]>([]);
    const { apiCall } = useApiCall();

    const fetchAllFactions = useCallback(() => {
        processTokens(() => {
            apiCall('factions', 'GET', null, (data: Faction[]) => {
                setAllFactions(data);
            });
        });
    }, []);

    useEffect(() => {
        fetchAllFactions();
    }, []);

    return { allFactions, setAllFactions, fetchAllFactions };
};

export default useFactions;