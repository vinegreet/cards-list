// API URLs
// TODO: Make these configurable

// Events list
const httpSchema = 'https://';
const apiUrl = 'staging-api.coing.co';
const endpoint = 'api/v2/communities/838/groups';
const params = '?page=1&pageSize=10&filterBy[closed]=0&filterBy[isPrivate]=0';
export const dataUrl = `${httpSchema}${apiUrl}/${endpoint}${params}`;
