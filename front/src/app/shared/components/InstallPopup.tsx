/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { styled } from '@linaria/react';
import { Popup } from '@app/shared/components';

interface AccountPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
}

const PopupSubtitle = styled.div`
  font-size: 28px;
  font-weight: bold;
  margin-top: 30px;
  text-align: center;
`;

const InstallPopup: React.FC<AccountPopupProps> = ({ visible, onCancel }) => {
  return (
    <Popup
        visible={visible}
        onCancel={onCancel}
      >
        <PopupSubtitle>Please install or enable Metamask extension.</PopupSubtitle>
      </Popup>
  );
};

export default InstallPopup;
