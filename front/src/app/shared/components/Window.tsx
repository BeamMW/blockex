import React, { useRef } from 'react';
import { styled } from '@linaria/react';
import { useDispatch } from 'react-redux';
import { IconBeamLogo } from '@app/shared/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

interface WindowProps {
  onPrevious?: React.MouseEventHandler | undefined;
  state?: 'content';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  padding-bottom: 50px;

  > .header {
    width: 100%;
    height: 110px;
    padding: 0 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    background-attachment: fixed;
    background-blend-mode: normal, multiply, multiply, multiply;
    background-image:
        linear-gradient(180deg, #000a16, #001f45),
        radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.5)),
        linear-gradient(to left, rgba(255, 255, 255, 0.5), #d33b65),
        linear-gradient(297deg, #156fc3, rgba(255, 255, 255, 0.5)),
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0), rgba(21, 6, 40, 0.12));

    > .logo {
      cursor: pointer;
      display: flex;
      align-self: start;

      > .icon {
        height: 38px;
        width: 31px;
      }

      > .title {
        margin-left: 25px;
        display: flex;
        flex-direction: column;

        > .beam{
          color: #25c1ff;
          font-weight: bolder;
          text-shadow: 1px 0 #25c1ff;
          letter-spacing: 12px;
          font-size: 17px;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          overflow: hidden;
        }

        > .explorer{
          margin-top: auto;
          color: #fff;
          font-size: 13px;
        }
      }
    }
  }
`;

const Window: React.FC<any> = ({
  children,
}) => {
  const rootRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoClicked = () => {
    navigate(ROUTES.MAIN.BASE);
  };
  
  return (
    <Container ref={rootRef}>
      <div className='header'>
        <div className='logo' onClick={logoClicked}>
          <IconBeamLogo className='icon'/>
          <span className='title'>
            <div className='beam'>BEAM</div>
            <div className='explorer'>Block Explorer</div>
          </span>
        </div>
      </div>
      <>
      { children }
      </>
    </Container>
  );
};

export default Window;
