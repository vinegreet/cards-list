import React from 'react';
import styled from 'styled-components';
import SvgAdminPanelSettings from '../SVGs/SvgAdminPanelSettings';
import SvgDraft from '../SVGs/SvgDraft';
import { Badges as BadgesType } from '../../api/models';

// TODO: remove this when we have real data
const isAdmin = true;

const BadgesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TextBadge = styled.div`
  background: rgba(255, 255, 255, 0.8);
  color: #333333;
  padding: 4px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Heebo', sans-serif;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconButton = styled.button`
  background: rgba(0, 0, 0, 0.1);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    fill: #ffffff;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    svg {
      fill: #333333;
    }
  }
`;

interface BadgesSectionProps {
  badges: BadgesType;
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ badges }) => {
  return (
    <BadgesContainer>
      {badges.customBadge && 
        <TextBadge>
          {badges.customBadge}
        </TextBadge>
      }
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