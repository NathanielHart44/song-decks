import axios from 'axios';
import { HOST_API } from 'src/config';

const axiosInstance = axios.create({
  baseURL: HOST_API,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject('We\'re having trouble connecting. Please try again later.')
    }

    return Promise.reject((error.response && error.response.data) || 'Something went wrong, please try again later.')
  }
);

export default axiosInstance;