import React, { useEffect } from 'react';
import { css } from '@linaria/core';

import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';
import 'react-toastify/dist/ReactToastify.css';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';

import { useNavigate, useRoutes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

// import 'semantic-ui-css/semantic.min.css';

const styleLink = document.createElement("link"); styleLink.rel = "stylesheet"; styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css"; document.head.appendChild(styleLink);

import './styles';

import { ROUTES } from '@app/shared/constants';
import {
  Blocks
} from '@app/containers';


const routes = () => [
  {
    path: ROUTES.MAIN.BASE,
    element: <Blocks />,
  },
  // {
  //   path: ROUTES.CONTRACTS.BASE,
  //   element: <Contracts />,
  // },
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
  );
};

export default App;
