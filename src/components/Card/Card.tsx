import React from 'react';
import styled from 'styled-components';
import mockPoster from '../../assets/mock-poster.jpg';
import PosterOverlay from './PosterOverlay';
import DateInfo from './DateInfo';
import EventDetails from './EventDetails';

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
  border-radius: 10px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PosterImage = styled.div<{ posterImage: string }>`
  width: 100%;
  height: 216px;
  background-image: ${props => `url(${props.posterImage})`};
  background-size: cover;
  background-position: center;
  background-color: #FFFFFF;
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

const Card: React.FC = () => {
  return (
    <CardContainer>
      <CardContent>
        <PosterImage posterImage={mockPoster}>
          <PosterOverlay participantsNumber={10} />
        </PosterImage>
        <InfoContainer>
          <DateInfo fromMonth="May" fromDay="10" untilMonth="May" untilDay="10" />
          <EventDetails 
            name="Event Name" 
            startDate="Start Date" 
            startTime="Start Time" 
            price="Price" 
            location="Location" 
          />
        </InfoContainer>
      </CardContent>
    </CardContainer>
  );
};

export default Card; 