import React from 'react';
import styled from 'styled-components';
import BadgesSection from './BadgesSection';
import ParticipantsNumber from './ParticipantsNumber';
import { Badges as BadgesType } from '../../api/models';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  &:hover .join-overlay {
    opacity: 1;
  }
`;

const AlignedBottomWrapper = styled.div`
  align-self: flex-end;
`;

const JoinOverlay = styled.span`
  font-family: 'Heebo', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #5A5A5A;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &:hover {
    color: #222222;
  }
`;

interface PosterOverlayProps {
  participantsNumber: number;
  badges: BadgesType;
}

const PosterOverlay: React.FC<PosterOverlayProps> = ({ participantsNumber, badges }) => {
  return (
    <OverlayContainer>
      <BadgesSection badges={badges} />
      <AlignedBottomWrapper>
        <ParticipantsNumber number={participantsNumber} />
      </AlignedBottomWrapper>
      {/* <JoinOverlay className="join-overlay">Join</JoinOverlay> */}
    </OverlayContainer>
  );
};

export default PosterOverlay; 