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

const StylesOverTable = css`
  width: 100%;
  padding: 20px 0;
  display: flex;
  align-items: center;

  > .pagination {
    margin-left: auto !important;
  }
`;

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

const StylesTable = css`
  width: 100%;
  margin: 0 !important;
`;

const StylesMenuControl = css`
  padding: 20px 100px 0;
  width: 100%;
`;

const StylesSubrow = css`
  border-top: none !important;
`;

const StylesRow = css`
  box-shadow: none !important;
`;

const GeneratedRow = styled.div<{ margin: number }>`
  padding: 10px 0;
  margin-left: ${({ margin }) => margin}px;

  > .generated-subrow {
    padding: 0 0 10px;
  }
`;

const AssetTableStyles = css`
  .asset_id {
    font-size: 16px;
    font-weight: 600;
  }

  .asset_value {
    font-size: 14px;
  }
`;

const AssetItem = styled.a`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: #4183c4;
  text-decoration: none;

  > .icon {
    margin-left: 5px;
  }

  > .text {
    font-weight: 600;
  }
`;

const StyledArgAsset = css`
  display: inline-flex;
  align-items: center;
`;

const StyledCidItem = css`
  cursor: pointer;
  color: #4183c4;
  text-decoration: none;
`;

const GenerateArgumentItem: React.FC<{item: {type: string, value: any}, itemKey: string}> = ({item, itemKey}) => {
  const assetData = item.type === 'aid' ? useSelector(selectAssetById(item.value)) : null;
  const onContractClicked = (cid: string) => {
    window.open(`${ROUTES.CONTRACTS.CONTRACT.replace(':cid', cid)}`, '_blank');
  }
  const { cid } = useParams();

  return (<>
    {item.type === 'aid' && 
    <span className={StyledArgAsset}>
      <span>{itemKey}</span>: <AssetItem>
        <AssetIcon className='icon' asset_id={item.value}></AssetIcon>
        <span className='text'>{item.value === 0 ? 'BEAM' : assetData.metadata['N']}</span>
        ({item.value})
      </AssetItem>
    </span>}
    {item.type === 'amount' && <div>
      {itemKey}: {fromGroths(item.value)}
    </div>}
    {item.type === 'cid' && 
    <>
      {itemKey ? `${itemKey}: ` : ''}
      <a onClick={() => onContractClicked(item.value)}
          className={item.value !== cid ? StyledCidItem : ''} >
        {item.value}
      </a>
    </>}
  </>);
};

const AssetsList: React.FC<{assets: {aid: number, value: number}[], isCallFunds?: boolean}> = ({assets, isCallFunds = false}) => {
  const onAssetClicked = (aid: number) => {
    window.open(`${ROUTES.ASSETS.ASSET.replace(':aid', ''+aid)}`, '_blank')
  }

  return (<Table className={AssetTableStyles} collapsing>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell> Asset </Table.HeaderCell>
                <Table.HeaderCell> Value </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {assets.map((asset, index) => {
                const aid = isCallFunds ? asset[0].value : asset.aid;
                const assetData = useSelector(selectAssetById(aid));

                return <Table.Row key={index}>
                  <Table.Cell>
                    <AssetItem onClick={() => onAssetClicked(aid)}>
                      <AssetIcon className='icon' asset_id={aid}></AssetIcon>
                      <span className='text'>{aid === 0 ? 'BEAM' : assetData.metadata['N']}</span>
                      ({aid})
                    </AssetItem>
                  </Table.Cell>
                  <Table.Cell>
                    <span className='asset_value'>{fromGroths(isCallFunds ? asset[1].value : asset.value)}</span>
                  </Table.Cell>
                </Table.Row>
              })}
            </Table.Body>
          </Table>);
}

const GeneratedTable = React.memo<{data: any}>(({data}) => {
  const headers = data.shift();
  return (<Table collapsing>
    <Table.Header>
      <Table.Row>
        {headers.map((header, index) => {
          return <Table.HeaderCell key={index}> {header.value} </Table.HeaderCell>
        })}
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {data.map((item, index) => {
        //TODO: integrate arg item
        return <Table.Row key={index}>
          {item.map((itemValue, itemValueIndex) => 
            <Table.Cell key={itemValueIndex}>
              {itemValue.type !== undefined ? itemValue.value : (
                Array.isArray(itemValue) ? (
                  itemValue.map((itemValueTmp, tmpIndex)=>{
                    return <GenerateArgumentItem key={tmpIndex} itemKey={itemValueTmp.type} item={itemValueTmp}/>
                  })
                ) : itemValue
              )}
            </Table.Cell>)}
        </Table.Row>
      })}
    </Table.Body>
  </Table>);
})

const GeneratedUI: React.FC<{dataObj: any, margin: number}> = ({dataObj, margin}) => {
  return (<GeneratedRow margin={margin}>
    { Object.keys(dataObj).map((key, keyIndex) => {
      let child;
      if (typeof dataObj[key] === 'string' || typeof dataObj[key] === 'number') {
        child = <>
          <span> {key}: </span>
          <span>{dataObj[key]}</span>
        </>
      } else if (dataObj[key].type && dataObj[key].type === 'table') {
        child = <>
          <div className='subtitle-inside'> {key}: </div>
          <GeneratedTable data={dataObj[key].value}></GeneratedTable>
        </>
      } else if (dataObj[key].type) {
        child = <GenerateArgumentItem item={dataObj[key]} itemKey={key}></GenerateArgumentItem>
      } else {
        child = <>
          <div className='subtitle-inside'> {key}: </div>
          <GeneratedUI dataObj={dataObj[key]} margin={margin + 15}></GeneratedUI>
        </>
      }

      return <div className='generated-subrow' key={keyIndex}>{child}</div>
    }) }
    
  </GeneratedRow>);
};

const CallRowValue: React.FC<{rowValue: any}> = ({rowValue}) => {
 return <>
    <Table.Row className='call-table-main-row'>
      <Table.Cell>{rowValue[0]}</Table.Cell>
      <Table.Cell>{rowValue[1].type ? <GenerateArgumentItem item={rowValue[1]} itemKey={''}></GenerateArgumentItem> : '-'}</Table.Cell>
      <Table.Cell>{rowValue[2] ? rowValue[2].value : '-'}</Table.Cell>
      <Table.Cell>{rowValue[3] ? rowValue[3] : '-'}</Table.Cell>
    </Table.Row>
    {rowValue[4] || rowValue[5] ? <Table.Row className={StylesRow}>
      <Table.Cell className={StylesSubrow} colSpan="7">
        {rowValue[4] ? <span className='arguments-section'>
            <div className='subtitle-inside'> ARGUMENTS: </div>
            {typeof rowValue[4] === 'string' ? 
              <span className='long-title'>{rowValue[4]}</span> :
              <Segment>
                <List divided relaxed>
                  {
                    Object.keys(rowValue[4]).map((key, keyIndex) => {
                      const argItem = rowValue[4][key];
                      if (argItem.type !== undefined) { 
                        return <List.Item key={keyIndex}>
                          <GenerateArgumentItem item={argItem} itemKey={key}/>
                        </List.Item>
                      } else if (typeof argItem === 'string') {
                        return <List.Item key={keyIndex}>
                          <div key={keyIndex}>{key}: {argItem}</div>
                        </List.Item>
                      }})
                  }
                </List>
              </Segment>
              
            }
          </span> : <></>}
        {rowValue[5] ? <span>
            <div className='subtitle-inside'> FUNDS: </div>
            <AssetsList assets={rowValue[5].value} isCallFunds={true}></AssetsList>
          </span> : <></>}
      </Table.Cell>
    </Table.Row> : <></>}
  </>
};

const CallTableRow: React.FC<{data: any}> = ({data}) => {
  return <>
    { data.type === 'single' ? 
      <CallRowValue rowValue={data.value[0]}></CallRowValue> :
      <>
        {data.value.map((callItem, callItemIndex) => {
          return <CallRowValue key={callItemIndex} rowValue={callItem}></CallRowValue>
        })}
      </>
    }
  </>
};

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
        <Segment>
          <div className='subtitle'> LOCKED FUNDS: </div>
          {contractData.locked_funds.length > 0 ?
            <AssetsList assets={contractData.locked_funds}></AssetsList> :
            '-'}
        </Segment>
        <Segment>
          <div className='subtitle'> OWNED ASSETS: </div>
          {contractData.owned_assets.length > 0 ?
            <AssetsList assets={contractData.owned_assets}></AssetsList> :
            '-'}
        </Segment>
        { contractData.state && Object.keys(contractData.state).length > 0 && <>
            <Segment>
              <div className='subtitle'> STATE: </div>
              <GeneratedUI dataObj={contractData.state} margin={0}></GeneratedUI>
            </Segment>
          </>
        }
        { contractData.calls && <Segment>
          <div className='subtitle'> CALLS ({contractData.calls_count}): </div>
          <div className={StylesOverTable}>
            <Pagination defaultActivePage={defaultPage ? defaultPage : 1} className="pagination"
                        onPageChange={paginationOnChange} totalPages={Math.ceil(contractData.calls_count / 50)} />
          </div>
          <div className={StylesTable}>
            <Table singleLine>
              <Table.Header className='calls-table-header'>
                <Table.Row>
                  <Table.HeaderCell>HEIGHT:</Table.HeaderCell>
                  <Table.HeaderCell>CID:</Table.HeaderCell>
                  <Table.HeaderCell>KIND:</Table.HeaderCell>
                  <Table.HeaderCell>METHOD:</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                { contractData.calls.map((call, index)=> {
                  return <CallTableRow key={index} data={call}></CallTableRow>
                }) }
              </Table.Body>
            </Table>
          </div>
        </Segment> }
      </Content> }
    </Window>
  );
};

export default ContractItem;
