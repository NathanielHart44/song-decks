// routes
import { PATH_PAGE } from './routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = '';

export const MAIN_API = {
  // base_url: "http://localhost:8080/",
  // base_url: "http://192.168.1.226:8080/",
  base_url: "https://asoiaf-decks.com:8080/",
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
// ----------------------------------------------------------------------
export const PATH_AFTER_LOGIN = PATH_PAGE.home;
export const NAVBAR = {
  BASE_HEIGHT: 64,
};
export const DEFAULT_BG_IMG = `linear-gradient(rgba(0, 0, 0, 0.40), rgba(0, 0, 0, 0.40)), url("https://d36mxiodymuqjm.cloudfront.net/website/battle/backgrounds/bg_stone-floor.png")`;
export const LANDING_BG_IMG = `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("https://asoiaf.cmon.com/assets/e9ae7536f5b06a6e19748212720e1166.jpg")`;
