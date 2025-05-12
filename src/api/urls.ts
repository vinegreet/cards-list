// API URLs
// TODO: Make these configurable

// Events list
const httpSchema = 'https://';
const apiUrl = 'staging-api.coing.co';
const endpoint = 'api/v2/communities/838/groups';
const fixedParams = '&filterBy[closed]=0&filterBy[isPrivate]=0'; 

// dataUrl is a function to allow dynamic page number and pageSize (batch size)
export const getDataUrl = (page: number, pageSize: number): string => {
  return `${httpSchema}${apiUrl}/${endpoint}?page=${page}&pageSize=${pageSize}${fixedParams}`;
};
