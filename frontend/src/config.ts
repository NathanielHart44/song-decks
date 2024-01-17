// routes
import { PATH_PAGE } from './routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = '';
export const VERSION = '1.0.0';

export const MAIN_API = {
  // base_url: "http://localhost:8080/",
  // base_url: "http://192.168.1.226:8080/",
  base_url: "https://asoiaf-decks.com:8080/",
  asset_url_base: "https://assets.asoiaf-decks.com/",
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
// ----------------------------------------------------------------------
export const PATH_AFTER_LOGIN = PATH_PAGE.home;
export const NAVBAR = {
  BASE_HEIGHT: 64,
};
export const DEFAULT_BG_IMG = `linear-gradient(rgba(0, 0, 0, 0.40), rgba(0, 0, 0, 0.40)), url("${MAIN_API.asset_url_base}additional-assets/bg_stone-floor.png")`;
export const LANDING_BG_IMG = `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("${MAIN_API.asset_url_base}additional-assets/iron_throne.jpeg")`;