import oauth from 'oauth';
import url from 'url';

/* BASIC API ENDPOINTS */
const baseURL = 'https://trello.com/1/';
const requestURL = `${baseURL}OAuthGetRequestToken`;
const accessURL = `${baseURL}OAuthGetAccessToken`;
const authorizeURL = `${baseURL}OAuthAuthorizeToken`;

const appName = 'Trello OAuth for sebisng2';
const key = '734feed8b99a158d3a9cd9af87e096f3';
const secret = '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54';

// TODO: implement Connector as class
