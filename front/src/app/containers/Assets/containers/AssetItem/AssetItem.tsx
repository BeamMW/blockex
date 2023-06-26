import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { useSelector } from 'react-redux';
import { ContractData } from '@core/types';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { Window, AssetIcon, BackControl } from '@app/shared/components';
import { ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { LoadContract } from '@core/api';
import { Table, Pagination, Segment, List } from 'semantic-ui-react';
import { selectAssetById } from '@app/shared/store/selectors';
import { fromGroths } from '@core/appUtils';

const Content = styled.div`
  width: 100%;
  padding: 20px 100px;

  .subtitle-segment {
    max-width: 200px;
  }

  .subtitle {
    font-weight: 800;
    font-size: 16px;
  }

  .subtitle-inside {
    font-weight: 800;
    font-size: 14px;
    text-transform: uppercase;
  }

  .arguments-section {
    margin-right: 50px;
    float: left;
  }

  .calls-table-header {
    position: sticky !important;
    top: 0;
    z-index: 2;
  }

  .call-table-main-row {
    background-color: rgb(249, 250, 251);
  }

  .long-title {
    word-break: break-word;
    white-space: pre-wrap;
    -moz-white-space: pre-wrap;   
  }

  > .calls {
    width: 100%;
  }
`;

const ContractItem: React.FC = () => {
    const [contractData, setContractData] = useState<ContractData>();
    const navigate = useNavigate();
    const { cid } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const defaultPage = searchParams.get("page");
    
    const updateData = async (page: number) => {
      const newData = await LoadContract(cid, page - 1);
      setContractData(newData);
    }
  
    useEffect(() => {
      updateData(defaultPage ? Number(defaultPage) : 1);
    }, []);
  
    const paginationOnChange = async (e, data) => {
      setSearchParams({["page"]: data.activePage});
      updateData(data.activePage);
    };
  
    const onBackClicked = () => {
      navigate(ROUTES.CONTRACTS.BASE);
    };
    
    return (
      <Window>
        {contractData && <Content>
          <BackControl onPrevious={onBackClicked}></BackControl>
          <Segment.Group>
            <Segment.Group horizontal>
              <Segment className='subtitle-segment'>
                <div className='subtitle'> CID: </div>
              </Segment>
              <Segment>{cid}</Segment>
            </Segment.Group>
            <Segment.Group horizontal>
              <Segment className='subtitle-segment'>
                <div className='subtitle'> HEIGHT: </div>
              </Segment>
              <Segment>{contractData.height}</Segment>
            </Segment.Group>
            <Segment.Group horizontal>
              <Segment className='subtitle-segment'>
                <div className='subtitle'> KIND: </div>
              </Segment>
              <Segment>{contractData.kind["Wrapper"] ? contractData.kind["Wrapper"] : contractData.kind}</Segment>
            </Segment.Group>
          </Segment.Group>
        </Content> }
      </Window>
    );
  };
  
  export default ContractItem;