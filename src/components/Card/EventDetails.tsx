import React from 'react';
import styled from 'styled-components';
import SvgEvent from '../SVGs/SvgEvent';
// import SvgNestClockFarsightAnalog from '../SVGs/SvgNestClockFarsightAnalog'; // Assuming time is part of startDateString for now
import SvgAttachMoney from '../SVGs/SvgAttachMoney';
import SvgLocationOn from '../SVGs/SvgLocationOn';
import LeaderInfo from './LeaderInfo';
import { Leader as LeaderType } from '../../api/models'; // Import LeaderType

interface EventDetailsProps {
  name: string;
  startDateString: string; // Combined date/time string or just date
  price: string;
  location: string;
  leader: LeaderType;
}

const DetailsContainer = styled.div`
  width: 100%;
  margin-bottom: 15px;
`;

const EventName = styled.h3`
  font-family: 'Heebo', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 140%;
  text-align: right;
  color: #222222;
  margin: 0 0 15px 0;
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  min-height: 21px;
  
  font-family: 'Heebo', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 150%;
  text-align: right;
  color: #5A5A5A;
  
  svg {
    width: 20px;
    height: 20px;
    fill: #BBBBBB;
    flex-shrink: 0;
  }
`;

const EventDetails: React.FC<EventDetailsProps> = ({
  name,
  startDateString,
  price,
  location,
  leader
}) => {
  // Helper to format date string if needed, or directly use it
  // For example, if startDateString is ISO and you want to show only date:
  const displayDate = startDateString !== 'N/A' ? new Date(startDateString).toLocaleDateString() : 'N/A';
  // If time is separate or needs specific formatting, that logic would go here.

  return (
    <DetailsContainer>
      <EventName>{name}</EventName>
      <DetailsList>
        <DetailItem>
          {displayDate} {/* Or use startDateString directly if format is acceptable */}
          <SvgEvent />
        </DetailItem>
        {/* 
        <DetailItem>
          {startTime} // If you have separate startTime from API 
          <SvgNestClockFarsightAnalog />
        </DetailItem>
        */}
        <DetailItem>
          {price}
          <SvgAttachMoney />
        </DetailItem>
        <DetailItem>
          {location}
          <SvgLocationOn />
        </DetailItem>
        <LeaderInfo name={leader.name} avatar={leader.avatar} /> {/* Pass leader info */}
      </DetailsList>
    </DetailsContainer>
  );
};

export default EventDetails; 