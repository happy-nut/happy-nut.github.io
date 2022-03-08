import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { Link } from 'gatsby'
import React from 'react'

import LogoIcon from '../../../../../assets/images/logo.svg'
import { TilHeaderContentProps } from './TilHeaderContentProps'

const TilHeaderMobile: React.FC<TilHeaderContentProps> = ({
  onMenuButtonClick
}) => (
  <AppBar>
    <Container maxWidth="xs">
      <Box display="flex" justifyContent="space-between" alignItems="center" py={1} px={2}>
        <Box width={40} height={40} component={Link} to="/">
          <LogoIcon />
        </Box>
        <IconButton onClick={onMenuButtonClick}>
          <MenuIcon />
        </IconButton>
      </Box>
    </Container>
  </AppBar>
)

export default TilHeaderMobile
