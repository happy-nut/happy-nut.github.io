import {Typography} from '@mui/material'
import {styled} from '@mui/material/styles';
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import GitHubIcon from '@mui/icons-material/GitHub'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import MailIcon from '@mui/icons-material/Mail'
import {graphql, useStaticQuery} from 'gatsby'
import {GatsbyImage} from "gatsby-plugin-image";
import React from 'react'
import {useSpring, animated} from 'react-spring'

const PREFIX = 'AboutSection';

const classes = {
  title: `${PREFIX}-title`,
  descriptionContainer: `${PREFIX}-descriptionContainer`,
  description: `${PREFIX}-description`,
  subDescription: `${PREFIX}-subDescription`,
  iconContainer: `${PREFIX}-iconContainer`,
  iconButton: `${PREFIX}-iconButton`,
  profileContainer: `${PREFIX}-profileContainer`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
  [`& .${classes.title}`]: {
    marginTop: theme.spacing(2),
    fontSize: '3rem',
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    fontWeight: 'bold',
    [theme.breakpoints.only('sm')]: {
      fontSize: '2.5rem'
    },
    [theme.breakpoints.only('xs')]: {
      fontSize: '1.5rem'
    }
  },

  [`& .${classes.descriptionContainer}`]: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      marginTop: theme.spacing(1.5)
    }
  },

  [`& .${classes.description}`]: {
    marginTop: theme.spacing(1),
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    [theme.breakpoints.only('xs')]: {
      fontSize: '0.9rem',
      marginTop: theme.spacing(0)
    }
  },

  [`& .${classes.subDescription}`]: {
    fontSize: '1rem',
    marginTop: theme.spacing(1),
    whiteSpace: 'pre-line',
    wordBreak: 'keep-all',
    [theme.breakpoints.only('xs')]: {
      fontSize: '0.8rem'
    }
  },

  [`& .${classes.iconContainer}`]: {
    marginTop: theme.spacing(6),
    [theme.breakpoints.only('sm')]: {
      marginTop: theme.spacing(4)
    },
    [theme.breakpoints.only('xs')]: {
      display: 'flex',
      justifyContent: 'space-evenly',
      marginTop: theme.spacing(4)
    }
  },

  [`& .${classes.iconButton}`]: {
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    boxSizing: 'border-box',
    borderRadius: theme.spacing(4.5),
    backgroundColor: 'white',
    border: '2px solid white',
    color: 'rgba(20, 150, 120)',
    cursor: 'pointer',
    transition: '0.3s',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'white'
    },
    [theme.breakpoints.only('xs')]: {
      margin: theme.spacing(0.5),
      marginTop: theme.spacing(0),
      width: 48,
      height: 48
    }
  },

  [`& .${classes.profileContainer}`]: {
    margin: theme.spacing(6),
    maxWidth: 700,
    maxHeight: 700,
    border: '17px solid white',
    willChange: 'transform',
    boxShadow: '0px 10px 30px -5px rgba(0, 0, 0, 0.3)',
    [theme.breakpoints.only('sm')]: {
      marginLeft: 0,
      maxWidth: '35vw',
      maxHeight: '35vw',
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
      border: '8px solid white',
      boxShadow: '0px 6px 20px -3px rgba(0, 0, 0, 0.3)'
    },
    [theme.breakpoints.only('xs')]: {
      marginTop: -theme.spacing(4),
      margin: 'auto',
      maxWidth: '35vw',
      maxHeight: '35vw',
      marginBottom: theme.spacing(2),
      border: '4px solid white',
      boxShadow: '0px 3px 10px -2px rgba(0, 0, 0, 0.3)'
    }
  }
}));

const calc = (x, y): number[] => {
  return [-(y - window.innerHeight / 2) / 140, (x - window.innerWidth / 2) / 140, 1.05]
}

const trans = (x, y, s): string => {
  return `perspective(700px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`
}

const AboutSection: React.FC = () => {
  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: {mass: 1, tension: 250, friction: 40}
  }))

  const profileQuery = useStaticQuery(graphql`{
    fileName: file(relativePath: {eq: "profile.png"}) {
      childImageSharp {
        gatsbyImageData(width: 700, height: 700, layout: CONSTRAINED)
      }
    }
  }
`)

  return (
    <StyledBox display="flex" height="90vh" alignItems="center" color="white">
      <Grid container alignItems="center">
        <Grid item xs={12} md={6}>
          <animated.div
            className={classes.profileContainer}
            onMouseMove={({clientX: x, clientY: y}) => set({xys: calc(x, y)})}
            onMouseLeave={() => set({xys: [0, 0, 1]})}
            style={{
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              transform: props.xys.interpolate(trans)
            }}
          >
            <GatsbyImage image={profileQuery.fileName.childImageSharp.gatsbyImageData} alt="profile image"/>
          </animated.div>
        </Grid>
        <Grid item md={1}> </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h1" className={classes.title}>🧐 So, Who am I?</Typography>
          <Box className={classes.descriptionContainer}>
            <Box pt={1.5}>
              <Typography variant="h4" className={classes.description}>
                밀도 있는 성장을 꿈꾸는 개발자입니다.
              </Typography>
              <Typography variant="body1" className={classes.subDescription}>
                꾸준히 어제의 나보다 나은 제 자신이 되었으면 합니다.
              </Typography>
            </Box>
            <Box pt={1.5}>
              <Typography variant="h4" className={classes.description}>
                즐겁게 일하고 싶은 개발자입니다.
              </Typography>
              <Typography variant="body1" className={classes.subDescription}>
                능력있는 사람들과 협업하면서 즐거움을 느낄 때 완전한 몰입이 됩니다.
              </Typography>
            </Box>
            <Box pt={1.5}>
              <Typography variant="h4" className={classes.description}>
                비즈니스적인 가치를 창출하고자 하는 개발자입니다.
              </Typography>
              <Typography variant="body1" className={classes.subDescription}>
                비즈니스적으로 경쟁력이 있어야 하는 부분에 기술적 탁월함을 부여하는 것이 제 임무입니다.
              </Typography>
            </Box>
          </Box>
          <Box className={classes.iconContainer}>
            <IconButton
              className={classes.iconButton}
              href="https://github.com/happy-nut"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GitHubIcon fontSize="large"/>
            </IconButton>
            <IconButton
              className={classes.iconButton}
              href="https://www.linkedin.com/in/poqw"
              target="_blank"
              rel="noreferrer noopener"
            >
              <LinkedInIcon fontSize="large"/>
            </IconButton>
            <IconButton
              className={classes.iconButton}
              href="https://www.instagram.com/hssongng/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <InstagramIcon fontSize="large"/>
            </IconButton>
            <IconButton
              className={classes.iconButton}
              href="mailto:happynut.dev@gmail.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              <MailIcon fontSize="large"/>
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </StyledBox>
  );
}

export default AboutSection
