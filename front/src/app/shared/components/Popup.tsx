import React from 'react';
import { styled } from '@linaria/react';

import { IconCancel, IconClose } from '@app/shared/icons';
import { css } from '@linaria/core';

import Backdrop from './Backdrop';
import Button from './Button';

interface PopupProps {
  title?: string;
  cancelButton?: React.ReactElement;
  confirmButton?: React.ReactElement;
  visible?: boolean;
  onCancel?: React.MouseEventHandler;
  footerClass?: string;
  className?: string;
}

const ContainerStyled = styled.div`
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 10px;
  background-color: var(--color-popup);
  color: white;
  width: 660px;
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;

  > .cancel-header {
    right: 4px;
    top: 10px;
    position: absolute;
  }
`;

const TitleStyled = styled.h2`
  font-size: 16px;
  margin: 0;
  margin-bottom: 20px;
  text-align: center;
`;

const FooterStyled = styled.div`
  display: flex;
  margin: 0 -7px;
  margin-top: 50px;
  justify-content: center;

  > button {
    margin: 0 15px !important;
  }
  &.justify-right {
    justify-content: right;
    margin-top: 40px;
  }
  &.qr-code-popup {
    > button {
      margin: 0 auto !important;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const IconCloseClass = css`
  margin-left: auto;
  cursor: pointer;
`;

const Popup: React.FC<PopupProps> = ({
  title,
  visible,
  onCancel,
  cancelButton = (
    <Button variant="ghost" icon={IconCancel} onClick={onCancel}>
      cancel
    </Button>
  ),
  confirmButton,
  children,
  footerClass,
  className
}) => (visible ? (
  <Backdrop onCancel={onCancel}>
    <ContainerStyled className={className}>
      <IconClose onClick={onCancel} className={IconCloseClass}/>
      <TitleStyled>{title}</TitleStyled>
      {/* <Button className="cancel-header" variant="icon" pallete="white" icon={IconCancel} onClick={onCancel} /> */}
      {children}
      <FooterStyled className={footerClass}>
        {confirmButton}
      </FooterStyled>
    </ContainerStyled>
  </Backdrop>
) : null);

export default Popup;
