/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { Commander } from 'src/@types/types';
import { useApiCall } from 'src/hooks/useApiCall';
import { processTokens } from 'src/utils/jwt';

const useCommanders = () => {
    const [allCommanders, setAllCommanders] = useState<Commander[]>([]);
    const { apiCall } = useApiCall();

    const fetchAllCommanders = useCallback(() => {
        processTokens(() => {
            apiCall('commanders', 'GET', null, (data: Commander[]) => {
                setAllCommanders(data);
            });
        });
    }, []);

    useEffect(() => {
        fetchAllCommanders();
    }, []);

    return { allCommanders, setAllCommanders, fetchAllCommanders };
};

export default useCommanders;