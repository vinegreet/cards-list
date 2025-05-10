import React from 'react';
import styled from 'styled-components';

interface ParticipantsNumberProps {
  number: number;
  isFull?: boolean;
}

const ParticipantsContainer = styled.div<{ isFull?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${props => props.isFull ? 'rgba(198, 4, 14, 0.8)' : 'rgba(34, 34, 34, 0.9)'};
  border-radius: 12px;
  padding: 8px;
  min-width: 30px;
  min-height: 16px;
  text-align: center;
`;

const Number = styled.span`
  font-family: 'Heebo', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #FFFFFF;
`;

const ParticipantsNumber: React.FC<ParticipantsNumberProps> = ({ number, isFull = false }) => {
  return (
    <ParticipantsContainer isFull={isFull}>
      <Number>
        +{number}
        {isFull && <span>/{number}</span>}
      </Number>
    </ParticipantsContainer>
  );
};

export default ParticipantsNumber; 