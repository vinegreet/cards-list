export interface Pagination {
    totalResults: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
}

export interface Image {
    type: string;
    src: string;
}

export interface Header {
    images: Image[];
    imageCredit: string;
    subscribedText: string;
}

export interface Leader {
    name: string;
    avatar: string;
}

export interface Badges {
    customBadge: string;
    groupFullText?: string; // Optional as it doesn't appear in all records
}

export interface Location {
    text?: string; // Optional
    type?: string; // Optional
    raw?: null; // Assuming raw is always null or not present
}

export interface ActivityBlock {
    location: Location | {}; // Can be an empty object
    startDate: string | null;
    endDate: string | null;
    date: {}; // Assuming it's an empty object, adjust if there's a structure
    duration: string;
    links: null; // Assuming links are always null or not present
    actionButton: string | null;
}

export interface Numbers {
    maxParticipants: number;
    participantsCount: number | null;
}

export interface Subscriber {
    name: string;
    avatar: string;
}

export interface People {
    title: string;
    numbers: Numbers;
    subscribers?: Subscriber[]; // Optional
}

export interface Content {
    label: string;
    value: string;
    key: string;
}

export interface SingleChoice {
    values: string[];
}

export interface Choices {
    singleChoices: SingleChoice[];
    multiChoices: any[]; // Adjust if there's a structure for multiChoices
    documents: any[]; // Adjust if there's a structure for documents
}

export interface Event {
    resourceLink: string;
    id: number;
    header: Header;
    leader: Leader;
    badges: Badges;
    name: string;
    donationInfo: {}; // Assuming it's an empty object, adjust if there's a structure
    activityBlock: ActivityBlock;
    paymentText: string;
    tags: string[];
    people: People;
    content: Content[];
    choices: Choices;
    gallery: any[]; // Adjust if there's a structure for gallery
    type: string;
    priority: number;
    parentCommunity: number | null;
    subcommunityLine: string;
    userSubscribedText: string | null;
}

export interface EventsApiData {
    pagination: Pagination;
    records: Event[];
}

export interface EventsApiResponse {
    status: string;
    message: string;
    code: number;
    data: EventsApiData;
}
