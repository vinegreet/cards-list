import React from 'react';
import styled from 'styled-components';
import logo from '../../logo.svg';

interface LeaderInfoProps {
  name: string;
  avatar?: string;
}

const LeaderContainer = styled.div`
  width: 100%;
  height: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: auto;
`;

const LeaderName = styled.div`
  font-family: 'Heebo', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  text-align: right;
  text-decoration-line: underline;
  color: #BBBBBB;
  cursor: pointer;
  
  &:hover {
    color: #5A5A5A;
  }
`;

const LeaderAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #F5F2F0;
  margin-left: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    width: 60%;
    height: auto;
  }
`;

const LeaderInfo: React.FC<LeaderInfoProps> = ({ name, avatar }) => {
  return (
    <LeaderContainer>
      <LeaderName>{name}</LeaderName>
      <LeaderAvatar>
        <img src={avatar || logo} alt={`${name}'s Avatar`} />
      </LeaderAvatar>
    </LeaderContainer>
  );
};

export default LeaderInfo; 