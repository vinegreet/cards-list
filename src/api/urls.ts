// API URLs
// TODO: Make these configurable

// Events list
const httpSchema = 'https://';
const apiUrl = 'staging-api.coing.co';
const endpoint = 'api/v2/communities/838/groups';
// Removed static page and pageSize, kept other fixed params
const fixedParams = '&filterBy[closed]=0&filterBy[isPrivate]=0'; 

// dataUrl is now a function to allow dynamic page and pageSize
export const getDataUrl = (page: number, pageSize: number): string => {
  return `${httpSchema}${apiUrl}/${endpoint}?page=${page}&pageSize=${pageSize}${fixedParams}`;
};
