// routes
import { PATH_PAGE } from './routes/paths';

// API
// ----------------------------------------------------------------------

// export const HOST_API = process.env.REACT_APP_HOST_API_KEY || '';
export const HOST_API = '';

export const MAIN_API = {
  // base_url: "http://localhost:8080/",
  base_url: "http://ec2-3-22-171-27.us-east-2.compute.amazonaws.com:8080/",
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
// ----------------------------------------------------------------------
export const PATH_AFTER_LOGIN = PATH_PAGE.home;
export const IMG_STORAGE = 'https://asoiaf-app.s3.us-west-1.amazonaws.com/'