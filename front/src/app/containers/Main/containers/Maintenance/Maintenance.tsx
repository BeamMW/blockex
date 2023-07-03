import React, { useEffect, useState, useCallback } from 'react';
import { Window } from '@app/shared/components';
import { Icon } from 'semantic-ui-react';
import { styled } from '@linaria/react';

const Content = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 20px;
    align-items: center;
    margin-top: 200px;

    span {
        margin-top: 30px;
    }
`;

const Maintenance: React.FC = () => {
    
    return (
      <Window>
        <Content>
            <Icon name='wrench' size='massive'/>
            <span>Beam Block Explorer is currently undergoing maintenance</span>
        </Content>
      </Window>
    );
  };
  
  export default Maintenance;