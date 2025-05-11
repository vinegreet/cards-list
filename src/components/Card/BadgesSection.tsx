import React from 'react';
import styled from 'styled-components';
import SvgAdminPanelSettings from '../SVGs/SvgAdminPanelSettings'; // Placeholder, decide if needed
import SvgDraft from '../SVGs/SvgDraft'; // Placeholder, decide if needed
import { Badges as BadgesType } from '../../api/models'; // Import BadgesType

const isAdmin = true;

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
  background: rgba(0, 0, 0, 0.1);
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
    svg {
      fill: #000000; /* Darker icon on hover */
    }
  }
`;

interface BadgesSectionProps {
  badges: BadgesType;
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ badges }) => {
  return (
    <BadgesContainer>
      {/* Display customBadge if it exists */}
      {badges.customBadge && 
        <TextBadge>
          {badges.customBadge}
        </TextBadge>
      }
      {/* TODO: check if here we should display admin badges instead */}
      {badges.groupFullText && 
        <TextBadge>
          {badges.groupFullText}
        </TextBadge>
      }
      {isAdmin && 
        <IconButton>
          <SvgAdminPanelSettings />
        </IconButton>
      }
      {isAdmin && 
        <IconButton>
          <SvgDraft />
        </IconButton>
      }
    </BadgesContainer>
  );
};

export default BadgesSection; 