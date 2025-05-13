import styled, { keyframes } from 'styled-components';

// Define keyframes for rotation
export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Styled component for the animated loader
export const AnimatedLoader = styled.div`
  border: 5px solid #f3f3f3; /* Light grey */
  border-top: 5px solid #555555; /* Darker grey */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${rotate} 1s linear infinite;
  margin: 20px auto; /* Center the loader */
`; 