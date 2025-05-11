import React from 'react';
import styled from 'styled-components';
import PosterOverlay from './PosterOverlay';
import DateInfo from './DateInfo';
import EventDetails from './EventDetails';
import { Event as EventType } from '../../api/models'; // Import EventType

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
  box-shadow: 0px 4px 17px rgba(0, 0, 0, 0.38);
  border-radius: 10px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PosterImage = styled.div<{ posterImage: string }>`
  width: 100%;
  height: 216px;
  background-image: ${props => props.posterImage ? `url(${props.posterImage})` : 'none'}; // Handle missing poster image
  background-size: cover;
  background-position: center;
  background-color: #808080;
  border-radius: 10px 10px 0px 0px;
  /*cursor: pointer;*/
  position: relative;
  
  &:hover {
    border-radius: 10px 10px 0px 0px;
  }
`;

const InfoContainer = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface CardProps {
  event: EventType;
}

const Card: React.FC<CardProps> = ({ event }) => {
  // Default or placeholder image if not available
  const posterSrc = event.header.images.find(img => img.type === 'thumbnail')?.src || event.header.images.find(img => img.type === 'cover')?.src || ''; // Use thumbnail or cover, fallback to empty string
  const participantsCount = event.people.numbers.participantsCount;

  // Extract date info - this might need more robust parsing based on actual date string formats
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
            // Assuming startDate contains time as well, or it's separate
            // For simplicity, just passing date for now. Time formatting would be needed.
            startDateString={event.activityBlock.startDate || 'N/A'} 
            // Price might come from a different field or need calculation
            price={event.paymentText || 'Free'} 
            location={(event.activityBlock.location && 'text' in event.activityBlock.location ? event.activityBlock.location.text : undefined) || 'Online'} 
            leader={event.leader}
          />
        </InfoContainer>
      </CardContent>
    </CardContainer>
  );
};

export default Card; 