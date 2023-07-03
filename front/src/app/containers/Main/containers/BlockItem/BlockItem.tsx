import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { BlockItemData, Kernel, Output, Input } from '@core/types';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { Window, AssetIcon, BackControl } from '@app/shared/components';
import { ROUTES, MENU_TABS_CONFIG } from '@app/shared/constants';
import { LoadBlock, LoadContract } from '@core/api';
import { Table, Accordion, Segment } from 'semantic-ui-react';
import { selectAssetById } from '@app/shared/store/selectors';
import { timestampToDate } from '@core/appUtils';

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

const StylesTableContent = css`
  min-height: 900px;
  width: 100%;
`;

const BlockItem: React.FC = () => {
  const [blockData, setBlockData] = useState<BlockItemData>();
  const navigate = useNavigate();
  const { hash } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPage = searchParams.get("page");
  
  const updateData = async () => {
    const newData = await LoadBlock(hash);
    setBlockData(newData);
  }

  useEffect(() => {
    updateData();
  }, []);

  const panels = [{
    key: `panel-1`,
    title: `INPUTS: ${blockData ? blockData.inputs.length : 0}`,
    content: {
      content: (
        blockData && blockData.inputs.length > 0 && <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>HEIGHT:</Table.HeaderCell>
              <Table.HeaderCell>COMMITMENT:</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            { blockData.inputs.map((input: Input, index: number)=> {
              return (<Table.Row key={index}>
                <Table.Cell>{input.height}</Table.Cell>
                <Table.Cell>{input.commitment}</Table.Cell>
              </Table.Row>);
            })}
          </Table.Body>
        </Table>
      ),
    },
  }, {
    key: `panel-2`,
    title: `OUTPUTS: ${blockData ? blockData.outputs.length : 0}`,
    content: {
      content: (
        blockData && blockData.outputs.length > 0 && <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>COMMITMENT:</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            { blockData.outputs.map((output: Output, index: number)=> {
              return (<Table.Row key={index}>
                <Table.Cell>{output.commitment}</Table.Cell>
              </Table.Row>);
            })}
          </Table.Body>
        </Table>
      ),
    },
  }, {
    key: `panel-3`,
    title: `KERNELS: ${blockData ? blockData.kernels.length : 0}`,
    content: {
      content: (
        blockData && blockData.kernels.length > 0 && <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID:</Table.HeaderCell>
              <Table.HeaderCell>FEE:</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            { blockData.kernels.map((kernel: Kernel, index: number)=> {
              return (<Table.Row key={index}>
                <Table.Cell>{kernel.id}</Table.Cell>
                <Table.Cell>{kernel.fee}</Table.Cell>
              </Table.Row>);
            })}
          </Table.Body>
        </Table>
      ),
    },
  }]

  const onBackClicked = () => {
    navigate(ROUTES.MAIN.BASE);
  };
  
  return (
    <Window>
      {blockData && <Content>
        <BackControl onPrevious={onBackClicked}></BackControl>
        <Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> HEIGHT: </div>
            </Segment>
            <Segment>{blockData.height}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> HASH: </div>
            </Segment>
            <Segment>{blockData.hash}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> CHAINWORK: </div>
            </Segment>
            <Segment>{blockData.chainwork}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> PREV: </div>
            </Segment>
            <Segment>{blockData.prev}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> AGE: </div>
            </Segment>
            <Segment>{timestampToDate(blockData.timestamp)}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> SUBSIDY: </div>
            </Segment>
            <Segment>{blockData.subsidy}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> BTC RATE: </div>
            </Segment>
            <Segment>{blockData.rate_btc}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> USD RATE: </div>
            </Segment>
            <Segment>{blockData.rate_usd}</Segment>
          </Segment.Group>
          <Segment.Group horizontal>
            <Segment className='subtitle-segment'>
              <div className='subtitle'> DIFFICULTY: </div>
            </Segment>
            <Segment>{blockData.difficulty}</Segment>
          </Segment.Group>
        </Segment.Group>
        <Accordion
          // defaultActiveIndex={[0, 2]}
          panels={panels}
          exclusive={false}
          fluid
        />
      </Content> }
    </Window>
  );
};

export default BlockItem;
