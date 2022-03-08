import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { Link } from 'gatsby'
import React from 'react'

import LogoIcon from '../../../../../assets/images/logo.svg'
import { TilHeaderContentProps } from './TilHeaderContentProps'

const TilHeaderTablet: React.FC<TilHeaderContentProps> = ({ onMenuButtonClick }) => (
  <AppBar>
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" py={1} pl={8} pr={7}>
        <Box width={48} height={48} component={Link} to="/">
          <LogoIcon />
        </Box>
        <IconButton onClick={onMenuButtonClick}>
          <MenuIcon />
        </IconButton>
      </Box>
    </Container>
  </AppBar>
)

export default TilHeaderTablet
