import API from './axios';


export const getOverview = () => API.get('/soc/overview');
export const getUsers = () => API.get('/soc/users');
export const getInteractions = () => API.get('/soc/interactions');
export const getAnalytics = () => API.get('/soc/analytics'); 


export const getUserDetail = (userId) => API.get(`/soc/user/${userId}`);




