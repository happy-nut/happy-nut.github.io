/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  siteMetadata: {
    siteTitle: '피스타치오는 맛있어',
    siteTitleAlt: `피스타치오는 맛있어`,
    siteHeadline: `피스타치오는 맛있어`,
    siteDescription: `피스타치오는 정말 맛있어`,
    siteLanguage: `ko`,
    siteUrl: 'https://happy-nut.github.io/',
    siteImage: `/banner.jpeg`,
    author: 'Hyungsun Song <happynut.dev@gmail.com>'
  },
  plugins: [
    {
      resolve: `@lekoarts/gatsby-theme-minimal-blog`,
      options: {
        showLineNumbers: true,
        navigation: [
          {
            title: `Blog`,
            slug: `/blog`,
          },
          {
            title: `About`,
            slug: `/about`,
          },
        ],
        externalLinks: [
          {
            name: `Instagram`,
            url: `https://www.instagram.com/hssongng/`,
          },
        ],
      }
    },
    {
      resolve: `gatsby-plugin-theme-ui`,
      options: {
        preset: "@theme-ui/base",
      },
    },
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [`https://fonts.gstatic.com`],
        interval: 300,
        timeout: 30000,
        // If you plan on changing the font you'll also need to adjust the Theme UI config to edit the CSS
        // See: https://github.com/LekoArts/gatsby-themes/tree/main/examples/minimal-blog#changing-your-fonts
        web: [
          {
            name: `IBM Plex Sans`,
            file: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `피스타치오는 맛있어`,
        short_name: `피스타치오는 맛있어`,
        description: `피스타치오는 맛있어`,
        start_url: `/`,
        background_color: `#fff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        theme_color: '#90B083',
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    {
      // SEO related.
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [
          'G-0MT5SWB76H', // Google Analytics.
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
    'gatsby-plugin-sharp',
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-google-adsense',
      options: {
        publisherId: 'ca-pub-2079653891316635'
      }
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://happy-nut.github.io`,
      }
    },
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://happy-nut.github.io',
        sitemap: 'https://happy-nut.github.io/sitemap/sitemap-index.xml',
        policy: [{userAgent: '*', allow: '/'}]
      }
    }
  ]
}
