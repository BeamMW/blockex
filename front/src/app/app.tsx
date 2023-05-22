import React, { useEffect } from 'react';
import { ROUTES } from '@app/shared/constants';
import { css } from '@linaria/core';

import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';
import 'react-toastify/dist/ReactToastify.css';

import { useNavigate, useRoutes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Scrollbars } from 'react-custom-scrollbars';

import './styles';
import { ROUTES_PATH } from '@app/shared/constants';
import {
  MainPage
} from '@app/containers/Main/containers';
const trackStyle = css`
  z-index: 999;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const routes = () => [
  {
    path: ROUTES_PATH.MAIN.BASE,
    element: <MainPage />,
  },
  // {
  //   path: ROUTES_PATH.MAIN.SEND_BY_ADDRESS,
  //   element: isLocked ? <Connect/> : <Send />,
  // },
  // {
  //   path: ROUTES_PATH.MAIN.RECEIVE,
  //   element: isLocked ? <Connect/> : <Receive />,
  // },
  // {
  //   path: ROUTES_PATH.MAIN.SEND,
  //   element: isLocked ? <Connect/> : <Send />,
  // },
  // {
  //   path: ROUTES_PATH.MAIN.CONNECT,
  //   element: !isLoggedIn || isLocked ? <Connect /> : <Navigate to={ROUTES_PATH.MAIN.BASE} />,
  // }
];

declare global {
  interface Window {
    ethereum: any;
  }
}

const App = () => {
  const dispatch = useDispatch();
  const content = useRoutes(routes());
  const navigate = useNavigate();
  const navigateURL = useSelector(sharedSelectors.selectRouterLink());
  

  useEffect(() => {
    if (navigateURL) {
      navigate(navigateURL);
      dispatch(sharedActions.navigate(''));
    }
  }, [navigateURL, dispatch, navigate]);
  
  return (
    // <Scrollbars
    //     renderThumbVertical={(props) => <div {...props} className={trackStyle} />}
    //   >
    <>
      {content}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        toastStyle={{
          textAlign: 'center',
          background: '#22536C',
          color: 'white',
          width: '90%',
          margin: '0 auto 36px',
          borderRadius: '10px',
        }}
      />
    </>
    // </Scrollbars>
  );
};

export default App;
