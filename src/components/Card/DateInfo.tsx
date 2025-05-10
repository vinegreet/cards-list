import React from 'react';
import styled from 'styled-components';

interface DateInfoProps {
  fromMonth: string;
  fromDay: string;
  untilMonth: string;
  untilDay: string;
}

const DateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const DateBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #F5F2F0;
  border-radius: 5px;
  padding: 5px 10px;
  min-width: 40px;
`;

const Month = styled.span`
  font-family: 'Heebo', sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #5A5A5A;
`;

const Day = styled.span`
  font-family: 'Heebo', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #222222;
`;

const UntilText = styled.div`
  font-family: 'Heebo', sans-serif;
  font-weight: 400;
  font-size: 12px;
  color: #BBBBBB;
`;

const DateInfo: React.FC<DateInfoProps> = ({ fromMonth, fromDay, untilMonth, untilDay }) => {
  return (
    <DateContainer>
      <DateBox>
        <Month>{fromMonth}</Month>
        <Day>{fromDay}</Day>
      </DateBox>
      <UntilText>Until</UntilText>
      <DateBox>
        <Month>{untilMonth}</Month>
        <Day>{untilDay}</Day>
      </DateBox>
    </DateContainer>
  );
};

export default DateInfo; 