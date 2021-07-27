/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  siteMetadata: {
    title: 'PORTILOG',
    description: 'Portfolio + TIL(Today I learned) + Blog for me.',
    author: 'Hyungsun Song <hssongng@gmail.com>',
    siteUrl: 'https://happy-nut.github.io/'
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [
          'G-FXX58F4MHY',
          'GTM-MCFTH46', // Google Tag Manager.
        ],
        // This object gets passed directly to the gtag config command
        // This config will be shared across all trackingIds
        gtagConfig: {
          optimize_id: 'OPT-TGKKQVR',
          cookie_expires: 0
        },
        // This object is used for configuration specific to this plugin
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: true,
          // Setting this parameter is also optional
          respectDNT: true,
          // Avoids sending pageview hits from custom paths
          exclude: []
        }
      }
    },

    // Local plugins.
    'gatsby-plugin-global-layout',

    // External plugins.
    'gatsby-plugin-typescript',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-material-ui',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/assets/images`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'tils',
        path: `${__dirname}/tils`
      }
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: /assets/
        }
      }
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md'],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              tracedSVG: true,
              quality: 90,
              backgroundColor: 'transparent'
            }
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              prompt: {
                user: 'happy-nut',
                host: 'localhost',
                global: true
              }
            }
          }
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#2CBBA0',
        theme_color: '#00A59F',
        display: 'minimal-ui',
        icon: 'assets/images/logo.png'
      }
    }
  ]
}
