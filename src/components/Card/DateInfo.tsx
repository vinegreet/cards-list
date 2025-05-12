import React from 'react';
import styled from 'styled-components';

interface DateInfoProps {
  startDate: Date | null;
  endDate: Date | null;
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
  min-width: 30px;
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

const DateInfo: React.FC<DateInfoProps> = ({ startDate, endDate }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return { month: 'N/A', day: 'N/A' };
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString();
    return { month, day };
  };

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  // If only start date is available, or if start and end dates are the same day
  const isSingleDayEvent = !endDate || (startDate && endDate && startDate.toDateString() === endDate.toDateString());

  return (
    <DateContainer>
      <DateBox>
        <Month>{startDateFormatted.month}</Month>
        <Day>{startDateFormatted.day}</Day>
      </DateBox>
      {!isSingleDayEvent && startDate && endDate && (
        <>
          <UntilText>Until</UntilText>
          <DateBox>
            <Month>{endDateFormatted.month}</Month>
            <Day>{endDateFormatted.day}</Day>
          </DateBox>
        </>
      )}
    </DateContainer>
  );
};

export default DateInfo; 