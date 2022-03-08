import { BoxProps } from '@mui/material'
import React from 'react'

import { Directory } from '../DirectoryList'

export interface TilSidebarContentProps extends BoxProps {
  isDrawerOpened?: boolean
  toggleDrawer: React.ReactEventHandler
  directory: Directory
}
