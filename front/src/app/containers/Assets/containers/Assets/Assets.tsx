import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { Asset } from '@core/types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Window, Button, StatusCards, AssetIcon } from '@app/shared/components';
import { selectAssetsData } from '../../store/selectors';
import { selectAllAssets, selectIsLoaded } from '@app/shared/store/selectors';
import { ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { Table, Search, Pagination, Menu, Card } from 'semantic-ui-react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import { loadAssets, setAssetsData } from '../../store/actions';
import { fromGroths} from '@core/appUtils';

const Content = styled.div`
  width: 100%;
  min-height: 400px;
  padding: 20px 140px;
  background-attachment: fixed;
  background-blend-mode: normal, multiply, multiply, multiply;
  background-image:
    linear-gradient(180deg, #032e49, #0073a6),
    radial-gradient(circle at 50% 0, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.5)),
    linear-gradient(to left, rgba(255, 255, 255, 0.5), #d33b65),
    linear-gradient(297deg, #156fc3, rgba(255, 255, 255, 0.5)),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0), rgba(21, 6, 40, 0.12));
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StylesOverTable = css`
  width: 100%;
  padding: 20px 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StylesTable = css`
  padding: 0 100px;
  width: 100%;
  margin: 0 !important;

  .centered {
    display: flex;
    align-items: center;

    > .text {
      font-weight: 600;
    }
  }
`;

const StylesMenuControl = css`
  padding: 20px 100px 0;
  width: 100%;
`;

const StylesTableRow = css`
  cursor: pointer;
`;

const StylesTableContent = css`
  min-height: 900px;
  width: 100%;
`;

const Assets: React.FC = () => {
  const [currentDate, setNewDate] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState(MENU_TABS_CONFIG[3].name);
  const onChange = (event, data) => setNewDate(data.value);
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPage = searchParams.get("page");
  const [activePage, setActivePage] = useState<number>(Number(defaultPage));
  const assetsData = useSelector(selectAssetsData());
  const allAssets = useSelector(selectAllAssets());
  const navigate = useNavigate();
  const isLoaded = useSelector(selectIsLoaded());

  const handleSearchChange = () => {
    
  };

  const handleMenuItemClick = (route: string) => {
    navigate(route);
  };

  const isActiveMenuItem = (name: string) => {
    return name === activeMenuItem;
  }

  const updateData = async (page: number) => {
    dispatch(loadAssets.request(page));
  }

  useEffect(() => {
    if (isLoaded) {
      updateData(defaultPage ? Number(defaultPage) : 1);
    }
  }, [isLoaded]);

  const paginationOnChange = async (e, data) => {
    setSearchParams({["page"]: data.activePage});
    await updateData(data.activePage);
  };

  const contractItemClicked = useCallback((aid: number) => {
    // navigate(`${ROUTES.CONTRACTS.CONTRACT.replace(':cid', '')}${cid}`);
  }, [navigate]);
  
  return (
    <Window>
      <Content>
        <StatusCards onUpdate={()=>updateData(activePage ? activePage : 1)}></StatusCards>
      </Content>
      <div className={StylesMenuControl}>
        <Menu pointing secondary>
          { MENU_TABS_CONFIG.map((tab, index) => 
            (<Menu.Item key={index}
              name={tab.name}
              disabled={tab.disabled}
              active={isActiveMenuItem(tab.name)}
              onClick={() => handleMenuItemClick(tab.route)}
            />)
          )}
        </Menu>
      </div>
      { assetsData && assetsData.assets &&
      <div className={StylesTableContent}>
        <div className={StylesOverTable}>
          <Search
            placeholder='Search...'
            onSearchChange={handleSearchChange}
            disabled={true}
            // results={results}
            // value={value}
          />
          <Pagination defaultActivePage={defaultPage ? defaultPage : 1} 
            onPageChange={paginationOnChange} totalPages={assetsData.pages} />
        </div>
        <div className={StylesTable}>
          <Table singleLine>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ASSET:</Table.HeaderCell>
                <Table.HeaderCell>NAME:</Table.HeaderCell>
                <Table.HeaderCell>LOCK HEIGHT:</Table.HeaderCell>
                <Table.HeaderCell>VALUE:</Table.HeaderCell>
                <Table.HeaderCell>MINTED BY:</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { assetsData.assets.map((asset: Asset, index: number)=> {
                return (
                <Table.Row key={index} onClick={() => contractItemClicked(asset.aid)} className={StylesTableRow}>
                  <Table.Cell>
                    <div className='centered'>
                      <AssetIcon asset_id={asset.aid}></AssetIcon>
                      <span className='text'>{asset.metadata['SN']}</span>
                      ({asset.aid})
                    </div>
                  </Table.Cell>
                  <Table.Cell>{asset.metadata['N']}</Table.Cell>
                  <Table.Cell>{asset.lock_height}</Table.Cell>
                  <Table.Cell>{fromGroths(asset.value)}</Table.Cell>
                  <Table.Cell>{asset.owner ? `OWNER: ${asset.owner}` : `CONTRACT: ${asset.cid}`}</Table.Cell>
                </Table.Row>);
              })}
            </Table.Body>
          </Table>
        </div>
      </div> }
    </Window>
  );
};

export default Assets;
