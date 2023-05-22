import React, { useState, useRef, HTMLAttributes } from 'react';
import { styled } from '@linaria/react';
import { CURRENCIES } from '@app/shared/constants';
import { css } from '@linaria/core';
import { IconDai, IconEth, IconUsdt, IconWbtc } from '@app/shared/icons';
import { useEffect } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  variant: 'amount' | 'common' | 'fee',
  onCurrChangeCb?: (item) => void
}

interface DropdownProps {
  isVisible: boolean
}

const ContainerStyled = styled.div`
  margin-top: 20px;
  position: relative;
  background-color: rgba(255, 255, 255, .05);
  border-radius: 10px;
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 15px;
`;

const InputStyled = styled.input<InputProps>`
  line-height: 20px;
  border: none;
  font-size: ${({ variant }) => `${variant === 'common' ? '16px' : '36px'}`};
  color: ${({ variant }) => `${variant === 'common' ? 'white' : '#da68f5'}`};
  background-color: transparent;
  width: ${({ variant }) => `${variant === 'common' ? '100%' : '90%'}`};
  height: 100%;
  -moz-appearance:textfield;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    position: absolute;
    top: 0;
    left: 3px;
    line-height: inherit;
    color: white;
    opacity: 0.3;
    font-size: 14px;
    font-style: italic;
  }
`;

const AddressClass = css`
  height: 55px;
`;

// const ErrorStyled = styled.div`
//   position: absolute;
//   top: 33px;
//   left: 0;
//   line-height: 26px;
//   font-size: 13px;
//   color: var(--color-failed);
// `;

const Selector = (data: {type: string, onCurrChange: (next)=>void}) => {
  const [isOpen, setOpen] = useState(false);
  const [items, setItem] = useState(CURRENCIES);
  const [selectedItem, setSelectedItem] = useState(items[0]);

  useEffect(()=>{
    data.onCurrChange(items[0]);
  }, [])
  
  const toggleDropdown = () => setOpen(!isOpen);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    data.onCurrChange(item);
    setOpen(false);
  }

  const StyledDropdown = styled.div`
    margin-left: auto;
  `;

  const DropdownElem = styled.div`
    cursor: pointer;
    background-color: transparent;
    border: none;
    font-size: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
  `;

  const DropdownElemOption = styled.div`
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 8px 0;
  `;

  const DropdownBody = styled.div<DropdownProps>`
    z-index: 100;
    position: absolute;
    background-color: #1c3a59;
    display: ${({ isVisible }) => `${isVisible ? 'block' : 'none'}`};
    border-radius: 10px;
    margin-top: 10px;
    margin-left: -19px;
    padding: 20px;
  `;

  const Triangle = styled.div`
    width: 0; 
    height: 0; 
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #8da1ad;
    margin-left: 5px;
  `;

  const CurrencyClass = css`
    line-height: 1;
    margin-left: 16px;
  `;
    
  const ICONS = {
    'bUSDT': () => <IconUsdt/>,
    'bWBTC': () => <IconWbtc/>,
    'bDAI': () => <IconDai/>,
    'bETH': () => <IconEth/>,
  };

  return data.type === 'amount' ? (
    <StyledDropdown>
      <DropdownElem onClick={toggleDropdown}>
        {ICONS[selectedItem.name]()}
        <span className={CurrencyClass}>{selectedItem.name}</span>
        <Triangle></Triangle>
      </DropdownElem>
      <DropdownBody isVisible={isOpen} className={`dropdown-body ${isOpen && 'open'}`}>
        {items.map(item => (
          <DropdownElemOption key={item.id} onClick={e => handleItemClick(item)}>
            {ICONS[item.name]()}
            <span className={CurrencyClass}>{item.name}</span>
          </DropdownElemOption>
        ))}
      </DropdownBody>
    </StyledDropdown>
  ) : (data.type === 'fee' ? (<StyledDropdown>
    <DropdownElem>
      {selectedItem.name}
    </DropdownElem>
  </StyledDropdown>) : <></>);
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant, error, onCurrChangeCb, ...rest }, ref) => {
    const [selectedCurrency, setCurr] = useState(null);

    const inputChange = (event) => {
      let value = event.target.value;
      var regex = new RegExp("^\\d*(\\.?\\d{0," + selectedCurrency.decimals + "})", "g");
      value = (value.match(regex)[0]) || null;
      event.target.value = value;
    };

    const currChanged = (next) => {
      setCurr(next);
      onCurrChangeCb(next);
    };

    return (
    <ContainerStyled className={variant === 'amount' ? AddressClass : null}>
      <InputStyled
        variant={variant} ref={ref} 
        onChange={variant === 'amount' || variant === 'fee' ? inputChange : null}
        type={variant === 'amount' || variant === 'fee' ? 'number' : 'text'}
        error={error} {...rest} />
      {variant === 'amount' &&
      <Selector type={variant} onCurrChange={currChanged}/>}
    </ContainerStyled>);
  },
);

export default Input;
