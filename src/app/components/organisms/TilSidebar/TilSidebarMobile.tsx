import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import CloseIcon from '@mui/icons-material/Close'
import _ from 'lodash'
import React from 'react'

import DirectoryList from '../DirectoryList'
import { TilSidebarContentProps } from './TilSidebarContentProps'

const TilSidebarMobile: React.FC<TilSidebarContentProps> = ({
  isDrawerOpened,
  toggleDrawer,
  directory
}) => (
  <SwipeableDrawer
    anchor='right'
    open={isDrawerOpened}
    onClose={toggleDrawer}
    onOpen={toggleDrawer}
  >
    <Box position="absolute" right={4} top={8}>
      <IconButton onClick={toggleDrawer}>
        <CloseIcon />
      </IconButton>
    </Box>
    <Box width="70vw" pt={6}>
      {
        _.map(directory.children, (childDirectory) => {
          return (
            <div key={childDirectory.name}>
              <DirectoryList directory={childDirectory} />
              <Divider />
            </div>
          )
        })
      }
    </Box>
  </SwipeableDrawer>
)

export default TilSidebarMobile
