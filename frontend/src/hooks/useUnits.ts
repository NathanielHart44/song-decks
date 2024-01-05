/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { Unit } from 'src/@types/types';
import { useApiCall } from 'src/hooks/useApiCall';
import { processTokens } from 'src/utils/jwt';

const useUnits = () => {
    const [allUnits, setAllUnits] = useState<Unit[]>([]);
    const { apiCall } = useApiCall();

    const fetchAllUnits = useCallback(() => {
        processTokens(() => {
            apiCall('units', 'GET', null, (data: Unit[]) => {
                setAllUnits(data);
            });
        });
    }, []);

    useEffect(() => {
        fetchAllUnits();
    }, []);

    return { allUnits, setAllUnits, fetchAllUnits };
};

export default useUnits;