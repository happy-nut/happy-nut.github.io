import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
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
