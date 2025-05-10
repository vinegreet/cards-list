import React from 'react';
import styled from 'styled-components';
import SvgAdminPanelSettings from '../SVGs/SvgAdminPanelSettings';
import SvgDraft from '../SVGs/SvgDraft';

const BadgesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// Renamed and restyled for Text Badges (pill-shaped)
const TextBadge = styled.div`
  background: rgba(255, 255, 255, 0.8);
  color: #333333; /* Dark text color */
  padding: 4px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Heebo', sans-serif; /* Consistent font */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// New styled component for Icon Buttons (circular)
const IconButton = styled.button`
  background: transparent;
  width: 28px;
  height: 28px;
  border-radius: 50%; /* Circular shape */
  border: none;
  padding: 0; /* Remove padding, use flex for centering */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px; /* Adjusted icon size */
    height: 24px; /* Adjusted icon size */
    fill: #333333; /* Dark icon color */
    flex-shrink: 0; /* Added to prevent clipping */
  }

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    /*background: rgba(255, 255, 255, 1);*/ /* More opaque background on hover */
    svg {
      fill: #000000; /* Darker icon on hover */
    }
  }
`;

const BadgesSection: React.FC = () => {
  return (
    <BadgesContainer>
      <TextBadge>
        Recommended {/* Placeholder for Hebrew text "שעת סיפור הורים וילדים! מומלץ" */}
      </TextBadge>
      <TextBadge>
        Pending Approval {/* Placeholder for Hebrew text "ממתין לאישור הנהלה" */}
      </TextBadge>
      <IconButton>
        <SvgAdminPanelSettings />
      </IconButton>
      <IconButton>
        <SvgDraft />
      </IconButton>
    </BadgesContainer>
  );
};

export default BadgesSection; 