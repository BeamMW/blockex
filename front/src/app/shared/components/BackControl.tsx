import React, { useRef } from 'react';
import { styled } from '@linaria/react';
import { IconBackWindow } from '@app/shared/icons';

interface BackControlProps {
  onPrevious?: React.MouseEventHandler;
}

const BackStyled = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 5px;
  font-weight: bold;
  font-size: 14px;

  > .control {
    cursor: pointer;
  }

  > .control .control-text {
    margin-left: 15px;
  }
`;

const BackControl: React.FC<BackControlProps> = ({ onPrevious }) => {
  return (
    <BackStyled>
      <div className='control' onClick={onPrevious}>
        <IconBackWindow/>
        <span className='control-text'>back</span>
      </div>
    </BackStyled>
  );
};

export default BackControl;
