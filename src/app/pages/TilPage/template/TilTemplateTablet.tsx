import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import React from 'react'

import { TilTemplateContentProps } from './TilTemplateContentProps'

const TilTemplateTablet: React.FC<TilTemplateContentProps> = ({
  header,
  post,
  sidebar
}) => (
  <Box bgcolor="white">
    {header}
    {sidebar}
    <Container maxWidth="md">
      <Box px={10} py={10}>
        {post}
      </Box>
    </Container>
  </Box>
)

export default TilTemplateTablet
