/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { NCU } from 'src/@types/types';
import { useApiCall } from 'src/hooks/useApiCall';
import { processTokens } from 'src/utils/jwt';

const useNCUs = () => {
    const [allNCUs, setAllNCUs] = useState<NCU[]>([]);
    const { apiCall } = useApiCall();

    const fetchAllNCUs = useCallback(() => {
        processTokens(() => {
            apiCall('ncus', 'GET', null, (data: NCU[]) => {
                setAllNCUs(data);
            });
        });
    }, []);

    useEffect(() => {
        fetchAllNCUs();
    }, []);

    return { allNCUs, setAllNCUs, fetchAllNCUs };
};

export default useNCUs;