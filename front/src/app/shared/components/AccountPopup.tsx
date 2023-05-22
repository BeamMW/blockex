/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { styled } from '@linaria/react';
import { Button, Popup } from '@app/shared/components';
import { IconCopyWhite, IconLogout } from '@app/shared/icons';

import { useSelector } from 'react-redux';
import { selectSystemState } from '@app/shared/store/selectors';
import { css } from '@linaria/core';
import { toast } from 'react-toastify';
import { selectBalance } from '@app/containers/Main/store/selectors';
import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';

interface AccountPopupProps {
  visible?: boolean;
  onCancel?: ()=>void;
}

const PopupSubtitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2.63px;
  margin-top: 30px;
`;

const PopupAccount = styled.div`
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.43;
  display: flex;
  flex-direction: raw;
`;

const CopyAccountClass = css`
  margin-left: 30px;
  cursor: pointer;
`;

const PopupCards = styled.div`
  margin-top: 20px;
  display: flex;
  width: 100%;
  flex-wrap: wrap
  justify-content: space-between;
`;

const AccountPopup: React.FC<AccountPopupProps> = ({ visible, onCancel }) => {
  const systemState = useSelector(selectSystemState());
  const balance = useSelector(selectBalance());
  
  const disconnectWalletClicked = () => {
    localStorage.setItem('locked', '1');
    window.location.reload();
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(systemState.account);
    toast('Address copied to clipboard');
  };

  return (
    <Popup
      visible={visible}
      onCancel={onCancel}
      title="Your wallet"
      confirmButton={(
        <Button onClick={disconnectWalletClicked} 
          pallete="red-disc" 
          variant="disconnect" 
          icon={IconLogout}>
          disconnect wallet
        </Button>
      )}>
      <PopupSubtitle>ETHEREUM BRIDGE ADDRESS</PopupSubtitle>
      <PopupAccount>
        <span>{systemState.account}</span>
        <IconCopyWhite onClick={handleCopyClick} className={CopyAccountClass}/>
      </PopupAccount>
      <PopupSubtitle>SUPPORTED TOKENS</PopupSubtitle>
      <PopupCards>
        {/* { balance.map(({ curr_id, rate_id, value, icon, is_approved }) => (
          <TokenCard icon={icon} 
            curr_id={curr_id}
            key={curr_id}
            rate_id={rate_id}
            type={icon}
            balanceValue={value}
            is_approved={is_approved}
          ></TokenCard>
        ))} */}
      </PopupCards>
    </Popup>
  );
};

export default AccountPopup;
