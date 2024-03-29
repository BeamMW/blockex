import React, { useEffect } from 'react';
import { css } from '@linaria/core';
import { actions as sharedActions, selectors as sharedSelectors } from '@app/shared/store';
import { useNavigate, useRoutes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

// import 'semantic-ui-css/semantic.min.css';

import { ROUTES } from '@app/shared/constants';
import {
  Blocks, Contracts, ContractItem, Assets, BlockItem,
} from '@app/containers';
import 'react-toastify/dist/ReactToastify.css';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import './styles';

const styleLink = document.createElement("link"); styleLink.rel = "stylesheet";
  styleLink.href = "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css"; document.head.appendChild(styleLink);


const routes = () => [
  {
    path: ROUTES.MAIN.BASE,
    element: <Blocks />,
  },
  {
    path: ROUTES.MAIN.BLOCK,
    element: <BlockItem />,
  },
  {
    path: ROUTES.CONTRACTS.BASE,
    element: <Contracts />,
  },
  {
    path: ROUTES.CONTRACTS.CONTRACT,
    element: <ContractItem />,
  },
  {
    path: ROUTES.ASSETS.BASE,
    element: <Assets />,
  },
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
