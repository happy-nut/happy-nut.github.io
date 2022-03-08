import Typography from '@mui/material/Typography'
import React from 'react'
import {useTheme} from "@mui/material";
import {styled} from "@mui/material/styles";

export const H1: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h1"
      color="textSecondary"
      marginBottom={theme.spacing(3)}
      marginTop={theme.spacing(4)}
    >
      {children}
    </Typography>
  )
}

export const H2: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h2"
      color="textSecondary"
      marginBottom={theme.spacing(1.5)}
      marginTop={theme.spacing(6)}
    >
      {children}
    </Typography>
  )
}

export const H3: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h3"
      color="textSecondary"
      marginBottom={theme.spacing(0.5)}
      marginTop={theme.spacing(4)}
    >
      {children}
    </Typography>
  )
}

export const H4: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h4"
      color="textSecondary"
      marginBottom={theme.spacing(0.5)}
      marginTop={theme.spacing(3)}
    >
      {children}
    </Typography>
  )
}

export const H5: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h5"
      color="textSecondary"
      marginBottom={theme.spacing(0.5)}
      marginTop={theme.spacing(1.5)}
    >
      {children}
    </Typography>
  )
}

export const H6: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="h6"
      color="textSecondary"
      marginBottom={theme.spacing(0.5)}
      marginTop={theme.spacing(1)}
    >
      {children}
    </Typography>
  )
}

export const P: React.FC = ({
  children
}) => {
  const theme = useTheme()

  return (
    <Typography
      variant="body1"
      color="textSecondary"
      marginBottom={theme.spacing(0.5)}
      marginTop={theme.spacing(0.5)}
    >
      {children}
    </Typography>
  )
}

const classes = {
  root: `Li-root`
};

const LiRoot = styled('li')(({ theme }) => ({
  [`& .${classes.root}`]: {
    marginTop: theme.spacing(1)
  }
}));

export const Li: React.FC = ({
  children
}) => {
  return (
      <LiRoot>
        <Typography variant="body2" color="textSecondary">
          {children}
        </Typography>
      </LiRoot>
  )
}

export { default as Img } from '../Image'
