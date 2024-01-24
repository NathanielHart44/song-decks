import axios from "axios";
import { MAIN_API } from "src/config";
import { useSnackbar } from "notistack";
import truncateText from "src/utils/truncateText";

// ----------------------------------------------------------------------

export const useApiCall = () => {
    const { enqueueSnackbar } = useSnackbar();

    const apiCall = async (
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        data?: any,
        onSuccess?: (response: any) => void,
        onError?: (error: any) => void
    ) => {
        try {
            const token = localStorage.getItem('accessToken') ?? '';
            const headers = { Authorization: `JWT ${token}` };
            let response;

            if (method === 'GET') {
                response = await axios.get(`${MAIN_API.base_url}${endpoint}/`, { headers });
            } else if (method === 'DELETE') {
                response = await axios.delete(`${MAIN_API.base_url}${endpoint}/`, { headers });
            } else if (method === 'PUT') {
                response = await axios.put(`${MAIN_API.base_url}${endpoint}/`, data, { headers });
            } else if (method === 'POST') {
                response = await axios.post(`${MAIN_API.base_url}${endpoint}/`, data, { headers });
            } else {
                throw new Error('Invalid method');
            }

            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            if (error.response.status === 404) {
                enqueueSnackbar('404: Not Found', { autoHideDuration: 5000, variant: 'error' });
                return;
            }
            console.error(error);
            if (onError) {
                onError(error);
            }
            const error_display = getSubmissionError(error);
            enqueueSnackbar(error_display, { autoHideDuration: 5000, variant: 'error' });
        }
    };

    return { apiCall };
};

// ----------------------------------------------------------------------

export const objectToFormData = (obj: any): FormData => {
    const formData = new FormData();

    const appendFormData = (key: string, value: any) => {
        if (value === undefined || value === null) { return };
        if (typeof value === 'object' && Array.isArray(value) === false) {
            formData.append(key, value.id);
        } else if (Array.isArray(value)) {
            value.forEach(item => {
                if (typeof item === 'object') {
                    let formatted_key = key.endsWith('s') ? key.slice(0, -1) : key;
                    formatted_key += '_ids';
                    formData.append(formatted_key, item.id.toString());
                } else {
                    formData.append(key, item);
                }
            });
        } else {
            formData.append(key, value);
        }
    };

    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            appendFormData(key, value);
        }
    });
    return formData;
};

// ----------------------------------------------------------------------

function getSubmissionError(error: any) {
    const error_data = error.response.data;
    let error_msg = '';
    if (error_data.text) {
        for (const key in error_data.text) {
            error_msg += `Error ${parseInt(key) + 1}: ${error_data.text[key]}\n`;
        }
        return error_msg;
    } else if (error_data.detail) {
        if (typeof error_data.detail === 'string') {
            error_msg = error_data.detail;
        } else if (typeof error_data.detail === 'object') {
            for (const key in error_data.detail) {
                error_msg += `${key.toUpperCase()}: ${error_data.detail[key]}\n`;
            }
        }
        return error_msg;
    } else {
        return truncateText(JSON.stringify(error_data), 280);
    }
}