import React from 'react'
import { Helmet } from 'react-helmet'

import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import defaultOgImage from './defaultOgImage.png'

export interface SEOProps {
  lang?: string
  meta?: []
  title?: string
  description?: string
  ogImage?: string
}

const createOgImagePath = (siteUrl: string, ogImage?: string): string => {
  if (ogImage != undefined && !ogImage.startsWith('/')) {
    return ogImage
  }

  return `${siteUrl}${ogImage || defaultOgImage}`
}

const SEO: React.FC<SEOProps> = ({ lang = 'ko', meta = [], title, description = '', ogImage }) => {
  const { description: siteDescription, title: siteTitle, author, siteUrl } = useSiteMetadata()
  const metaDescription = description || siteDescription
  const metaTitle = title || siteTitle
  const image = createOgImagePath(siteUrl, ogImage)

  return (
    <Helmet
      htmlAttributes={{ author, lang }}
      defaultTitle={siteTitle}
      title={title}
      titleTemplate={`%s | ${siteTitle}`}
      meta={[
        {
          name: 'description',
          content: metaDescription
        },
        {
          property: 'og:title',
          content: metaTitle
        },
        {
          property: 'og:description',
          content: metaDescription
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:image',
          content: image
        },
        {
          name: 'twitter:card',
          content: 'summary'
        },
        {
          name: 'twitter:creator',
          content: author
        },
        {
          name: 'twitter:title',
          content: metaTitle
        },
        {
          name: 'twitter:image',
          content: image
        },
        {
          name: 'twitter:description',
          content: metaDescription
        },
        {
          name: 'image',
          content: image
        },
      ].concat(meta)}
    >
      <title>{metaTitle}</title>
    </Helmet>
  )
}

export default SEO
