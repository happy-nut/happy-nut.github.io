import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Link } from 'gatsby'
import _ from 'lodash'
import React from 'react'

import { useSidebarDispatch, useSidebarState } from '../../../store/sidebarStore'

const PREFIX = 'DirectoryList';

const classes = {
  link: `${PREFIX}-link`,
  displayName: `${PREFIX}-displayName`
};

const StyledList = styled(List)(({theme}) => ({
  [`& .${classes.link}`]: {
    textDecoration: 'none',
    color: theme.palette._dark[200],
    '& :hover': {
      fontWeight: 'bold'
    }
  },

  [`& .${classes.displayName}`]: {
    color: theme.palette._dark[300]
  }
}));

export interface Directory {
  displayName: string
  path: string
  children?: Directory[]
}

interface Props {
  directory: Directory
}

const DirectoryList: React.FC<Props> = ({ directory }) => {

  const sidebarState = useSidebarState()
  const sidebarDispatch = useSidebarDispatch()

  const renderNestedDirectories = (children, directoryDepth = 1): React.ReactNode => {
    return _.map(children, (child: Directory) => {
      if (_.isEmpty(child.children)) {
        return (
          <ListItem
            button
            component={Link}
            to={child.path}
            key={child.path}
            className={classes.link}
          >
            <Box pl={directoryDepth}>
              <Typography variant="caption">{child.displayName}</Typography>
            </Box>
          </ListItem>
        )
      }

      return (
        <div key={child.path}>
          <ListItem
            button
            onClick={() => {
              sidebarDispatch({
                type: 'ITEM_CLICKED',
                payload: { clickedItemName: child.displayName }
              })
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Box pl={directoryDepth}>
                <Typography variant="body2" className={classes.displayName}>
                  {child.displayName}
                </Typography>
              </Box>
              {sidebarState[child.displayName]
                ? <ExpandLess fontSize="small" />
                : <ExpandMore color="action" fontSize="small" />}
            </Box>
          </ListItem>
          <Collapse in={sidebarState[child.displayName]} timeout="auto" unmountOnExit>
            {renderNestedDirectories(child.children, directoryDepth + 1)}
          </Collapse>
        </div>
      )
    })
  }

  return (
    <StyledList>
      <ListItem
        button
        onClick={() => {
          sidebarDispatch({
            type: 'ITEM_CLICKED',
            payload: { clickedItemName: directory.displayName }
          })
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography variant="body1" className={classes.displayName}>
            {directory.displayName}
          </Typography>
          {sidebarState[directory.displayName]
            ? <ExpandLess color="action" fontSize="small" />
            : <ExpandMore color="action" fontSize="small" />}
        </Box>
      </ListItem>
      <Collapse in={sidebarState[directory.displayName]} timeout="auto" unmountOnExit>
        {renderNestedDirectories(directory.children)}
      </Collapse>
    </StyledList>
  );
}

export default DirectoryList
