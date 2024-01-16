/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useEffect } from 'react';
import { Attachment } from 'src/@types/types';
import { useApiCall } from 'src/hooks/useApiCall';
import { processTokens } from 'src/utils/jwt';

const useAttachments = () => {
    const [allAttachments, setAllAttachments] = useState<Attachment[]>([]);
    const { apiCall } = useApiCall();

    const fetchAllAttachments = useCallback(() => {
        processTokens(() => {
            apiCall('attachments', 'GET', null, (data: Attachment[]) => {
                setAllAttachments(data);
            });
        });
    }, []);

    useEffect(() => {
        fetchAllAttachments();
    }, []);

    return { allAttachments, setAllAttachments, fetchAllAttachments };
};

export default useAttachments;