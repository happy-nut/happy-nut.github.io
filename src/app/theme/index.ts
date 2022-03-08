import { createTheme } from '@mui/material/styles'
import responsiveFontSizes from '@mui/material/styles/responsiveFontSizes'

import { overrides } from './overrides'
import { palette } from './palette'
import { typography } from './typography'

const theme = createTheme({
  components: {
    ...overrides
  },
  palette,
  typography
})

export default responsiveFontSizes(theme)
