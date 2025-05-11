import React from 'react';
import styled from 'styled-components';
import PosterOverlay from './PosterOverlay';
import DateInfo from './DateInfo';
import EventDetails from './EventDetails';
import { Event as EventType, Image } from '../../api/models'; // Added Image for typing
import { useEvents } from '../../api/hooks'; // Corrected import path

const CardContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  padding: 20px;
  width: 342px;
  height: 468px;
  border-radius: 5px;
`;

const CardContent = styled.div`
  width: 302px;
  height: 428px;
  background: #FFFFFF;
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.08);
  /* Duplicated box-shadow, remove after development phase */
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.38);
  border-radius: 10px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PosterImage = styled.div<{ posterImage: string }>`
  width: 100%;
  height: 216px;
  background-image: ${props => props.posterImage ? `url(${props.posterImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-color: #808080; /* Fallback color */
  border-radius: 10px 10px 0px 0px;
  position: relative;
`;

const InfoContainer = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface CardProps {
  eventId: number;
}

const CardComponent: React.FC<CardProps> = ({ eventId }) => {
  const { eventsMappedById } = useEvents(); 
  
  const event = eventsMappedById[eventId];

  if (!event) {
    return <CardContainer>Event (ID: {eventId}) not found.</CardContainer>;
  }

  const posterSrc = event.header.images.find((img: Image) => img.type === 'thumbnail')?.src || 
                    event.header.images.find((img: Image) => img.type === 'cover')?.src || '';
  const participantsCount = event.people.numbers.participantsCount;

  const startDate = event.activityBlock.startDate ? new Date(event.activityBlock.startDate) : null;
  const endDate = event.activityBlock.endDate ? new Date(event.activityBlock.endDate) : null;

  return (
    <CardContainer>
      <CardContent>
        <PosterImage posterImage={posterSrc}>
          <PosterOverlay 
            participantsNumber={participantsCount !== null ? participantsCount : 0} 
            badges={event.badges}
          />
        </PosterImage>
        <InfoContainer>
          <DateInfo 
            startDate={startDate} 
            endDate={endDate} 
          />
          <EventDetails 
            name={event.name} 
            startDateString={event.activityBlock.startDate || 'N/A'} 
            price={event.paymentText || 'Free'} 
            location={(event.activityBlock.location && 'text' in event.activityBlock.location ? event.activityBlock.location.text : undefined) || 'Online'} 
            leader={event.leader}
          />
        </InfoContainer>
      </CardContent>
    </CardContainer>
  );
};

export default React.memo(CardComponent); 