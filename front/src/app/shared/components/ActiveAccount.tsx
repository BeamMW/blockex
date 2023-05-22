import React from 'react';
import { styled } from '@linaria/react';
import { formatActiveAddressString } from '@core/appUtils';

interface ActiveAccountProps {
  text: string;
  onClick?: React.MouseEventHandler
}

const AccountStyled = styled.div`
  padding: 11px 30px;
  border-radius: 22.5px;
  border: solid 1px #fff;
  background-color: rgba(255, 255, 255, 0.1);
  align-self: flex-end;
  margin 60px 80px 0 0;
  cursor: pointer
`;

const ActiveAccount: React.FC<ActiveAccountProps> = ({
  text,
  onClick
}) => {

  const textFormatted = formatActiveAddressString(text);
  
  return (
  <AccountStyled onClick={onClick}>
    {textFormatted}
  </AccountStyled>
)};

export default ActiveAccount;
