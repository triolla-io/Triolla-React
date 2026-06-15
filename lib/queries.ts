export const GET_SERVICES_PAGE = `
  query GetServicesPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_ServicePage {
          servicePage {
            headerSubText
            headerTitle
            boldText
            shortText
            moreText
            buttonText
            headerBgColor
            headerBgOverlayLayer { node { sourceUrl } }

            prodtitle
            prodtitleLink
            proddtxt
            prodrightMenu {
              prodmtitle
              prodmlink
            }
            prodleftImageOne { node { sourceUrl } }
            prodleftImageTwo { node { sourceUrl } }
            prodleftImageThree { node { sourceUrl } }
            prodleftImageFour { node { sourceUrl } }
            prodleftImageFive { node { sourceUrl } }
            prodleftImageSix { node { sourceUrl } }
            prodleftImageSeven { node { sourceUrl } }
            prodleftImageEight { node { sourceUrl } }
            prodleftImageNine { node { sourceUrl } }

            brandtitle
            brandtitleLink
            brandtext
            brandrightMenu {
              rightmetitle
              rightmelink
            }
            brandimageOne { node { sourceUrl } }
            brandimageTwo { node { sourceUrl } }
            brandimageThree { node { sourceUrl } }
            brandimageFour { node { sourceUrl } }
            brandimageFive { node { sourceUrl } }
            brandimageSix { node { sourceUrl } }

            devtitle
            devtitleLink
            devtext
            devrightMenuToptitle
            devrightMenuToptitleCopy
            devrightMenuToptitleLink
            rightMenuTopList { rightTopMenuItem }
            devrightMenuBottitle
            devrightMenuBottitleLink
            rightMenuBotList {
              rightBottomMenuItem
            }
            rightMenuThreeTitle
            rightMenuThreeTitleLink
            rightMenuThreeList {
              rightThreeMenuItem
            }
            devleftimage { node { sourceUrl } }
          }
        }
      }
    }
  }
`

/**
 * Build a single batched query that fetches every service detail page in one
 * round trip. Each URI gets its own aliased `page(idType: URI)` selection
 * (s0, s1, …). We pull only the four clean fields the modal renders — the old
 * site's form/grid/script chrome lives in `content` markup we re-typeset, not
 * separate fields. Pages on the `page-servicedetail.php` template resolve as
 * `Template_ServiceDetailPage` and expose ACF `topBoldText` via `postFields`.
 *
 * URIs must be the WP path only (e.g. "services/product-ux-ui-design"), no host.
 */
export function buildServiceDetailsQuery(uris: string[]): string {
  const fields = `
    title
    featuredImage { node { sourceUrl altText } }
    content
    template {
      ... on Template_ServiceDetailPage {
        postFields { topBoldText }
      }
    }`

  const selections = uris.map((uri, i) => `    s${i}: page(id: ${JSON.stringify(uri)}, idType: URI) {${fields}\n    }`).join('\n')

  return `query GetServiceDetails {\n${selections}\n}`
}


// Same shape as GET_HOME_PAGE but URI-parameterized so the Home route can
// fetch the page for the active locale (en `/`, he `home-new-he`).
export const GET_HOME_PAGE_BY_URI = `
  query GetHomePageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_HomePageNew {
          homePage {
            topsectitle
            toptext
            uDesignHeading
            uSortText
            designType { dName }
            winTitle
            winSubtitle
            wboxes { wboxTitle winImg { node { sourceUrl } } }
            abthretitle
            abtthretext
            abthrebuttonText
            abthrebuttonLink
            abthrelist {
              abteintitle
              abthreintext
              abthreimage { node { sourceUrl } }
            }
          }
        }
      }
    }
  }
`

export const GET_CONTACT_PAGE = `
  query GetContactPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      template {
        ... on Template_ContactPage {
          contactFields {
            contactTitle
            officeTitle
            officeTitleCopy
            addressTitle
            address
            addressTitleCopy
            addressCopy
            contactNumber
            contactNumberCopy
            headerBgOverlayLayer { node { sourceUrl } }
          }
        }
      }
    }
  }
`

// Generic fetch for simple/legal content pages (privacy-policy, terms-of-use,
// accessibility-statement, …). These render the WP page title + post content
// HTML — no bespoke ACF layout. URI is the WP path, e.g. "privacy-policy".
export const GET_CONTENT_PAGE = `
  query GetContentPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      content
    }
  }
`

// Careers page — Template_CareerPage ACF. Hero (headerTitle/boldText/…), a job
// list (jobsList repeater) and two image galleries (topImages, gImageList).
export const GET_CAREERS_PAGE = `
  query GetCareersPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_CareerPage {
          careerFields {
            headerTitle
            boldText
            shortText
            moreText
            buttonText
            headerBgColor
            jHeading
            jShortText
            topImages { tImage { node { sourceUrl } } }
            gImageList { gImage { node { sourceUrl } } }
            jobsList {
              jobName
              noOfPositions
              aboutLabel
              aboutDescription
              jobDescriptionLabel
              jobDescription
              requirementsLabel
              requirements { jText }
              applyEmail
            }
          }
        }
      }
    }
  }
`

// Branding & Studio — a single service-detail page (Template_ServiceDetailPage)
// promoted to its own standalone route. Pulls the title, hero image, the bold
// lead (ACF topBoldText) and the body content HTML re-typeset on the page.
export const GET_BRANDING_STUDIO = `
  query GetBrandingStudio($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      featuredImage { node { sourceUrl altText } }
      content
      template {
        ... on Template_ServiceDetailPage {
          postFields { topBoldText }
        }
      }
    }
  }
`

export const GET_FOOTER_DATA = `
  query GetFooterData {
    menus {
      nodes {
        name
        slug
        menuItems(first: 20) {
          nodes {
            label
            url
          }
        }
      }
    }
  }
`

export const GET_THEME_SETTINGS = `
  query GetThemeSettings {
    themeSetting {
      themeOptions {
        bookButton
        bookButtonLink
        contactButton
        contactButtonLink
        whatsappNumber
        whatsappMessage
        newsTicker
        siteLogo { node { sourceUrl altText } }
        siteLogoWhite { node { sourceUrl altText } }
        footerLogo { node { sourceUrl altText } }
        footerMentionsLabel
        mentionsLogos {
          mentionLogo { node { sourceUrl } }
          mentionLogoLink
        }
        emailAddress
        tlvOfficesLabel
        tlvOfficesPhone
        nyOfficesLabel
        nyOfficesPhone
        sqlink
        facebookLink
        instagramLink
        tiktokLink
        linkedinLink
        socialMenuItems {
          socialMediaLink
          socialMediaText
        }
        footerPrivacyText
        footerPrivacyLink
        footerTermText
        footerTermLink
        footmenuTitleOne
        footmenuTitleTwo
        footmenuTitleThree
        footmenuTitleFour
        footmenuTitleFive
        cLeftHeading
        cContactFormHeading
        cCallUsLabel
        cEmailAddress
        cEmailLabel
        cTlvLabel
        cTlvNumber
        cNyLabel
        cNyNumber
        cAddress
        cAddressLabel
        faqHeading
        faqShortText
        questionAnswerList {
          fQuestion
          fAnswer
        }
        ourClientsHeading
        ourClientBigText
        cButton
        clientsLogos {
          cLogo { node { sourceUrl altText } }
        }
        commonGridOneImage { node { sourceUrl } }
        commonGridOneMobile { node { sourceUrl } }
        menuBackgroundImage { node { sourceUrl } }
      }
    }
  }
`

export const GET_PRIMARY_MENU = `
  query GetPrimaryMenu {
    primaryMenu: menu(id: "header-menu", idType: SLUG) {
      menuItems(first: 50) {
        nodes {
          databaseId
          label
          url
          parentDatabaseId
        }
      }
    }
  }
`

export const GET_PORTFOLIO_SLUGS = `
  query GetPortfolioSlugs {
    pages(first: 100) {
      nodes {
        uri
        databaseId
        template {
          __typename
        }
        translations {
          href
          locale
        }
      }
    }
  }
`

export const GET_PORTFOLIO_PAGE = `
  query GetPortfolioPage($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      template {
        ... on Template_PortfolioPage {
          portfolioFields {
            headerTitle
            headerSubText
            boldText
            shortText
            moreText
            buttonText
            pPartnerButton
            partnerWithUsText
            uDesignHeading
            uSortText
            whyDoHeading
            headerBgColor
            headerBgOverlayLayer { node { sourceUrl } }
            designType { dName }
            companyList { companyName }
            whyDoList { whyTitle whyShortText }
            gImageList { gImage { node { sourceUrl } } }
            portfolioList {
              pTitle
              sortText
              pTags { tagName }
              pImage { node { sourceUrl } }
              pImageMob { node { sourceUrl } }
              pLogo { node { sourceUrl } }
              popupTopText
              popupGalleryImages { galleryImage { node { sourceUrl } } }
            }
          }
        }
      }
    }
  }
`

export const GET_ABOUT_PAGE = `
  query GetAboutPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_AboutPage {
          aboutPage {
            headerTitle
            headerSubText
            boldText
            shortText
            moreText
            buttonText
            headerBgColor
            headerBgOverlayLayer { node { sourceUrl } }
            toprightTitle
            toprightext
            abtopleftImageTop { node { sourceUrl } }
            abtopleftImageTwo { node { sourceUrl } }
            leftImageTopThree { node { sourceUrl } }
            imagesSection { 
              imageText
              topabtext
              topimages { node { sourceUrl } }
            }
            servtitle
            servtext
            servlist { 
              servlleftText
              servrightList { listItem itemLink linkTarget }
            }
            abthretitle
            abtthretext
            abthrebuttonText
            abthrebuttonLink
            abthrelist {
              abteintitle
              abthreintext
              abthreimage { node { sourceUrl } }
            }
            uDesignHeading
            uSortText
            designType {
              dName
            }
            learntitle
            learntext
            learnslider {
              learntext
              learnimage { node { sourceUrl } }
              learnvideo { node { mediaItemUrl } }
            }
            # faqItems and clientLogos — uncomment once ACF fields are created in WP
            # faqItems { faqQuestion faqAnswer }
            # clientLogos { logoImage { node { sourceUrl } } logoName }
          }
        }
      }
    }
  }
`

export const GET_TECHNOLOGY_PAGE = `
  query GetTechnologyPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_TechnologyPage {
          technologyPage {
            headerTitle
            headerSubText
            buttonText
            headerBgColor
            headerBgOverlayLayer { node { sourceUrl } }

            companyList {
              companyName
            }

            midImageRightTitle
            midImageOne { node { sourceUrl } }
            midImageTwo { node { sourceUrl } }
            midImageTwoTitle
            midImageThree { node { sourceUrl } }
            midImageThreeTitle
            midImageFour { node { sourceUrl } }
            midImageFourTitle
            midImageFive { node { sourceUrl } }
            midImageFiveTitle
            midImageSix { node { sourceUrl } }
            midImageSixTitle
            midImageSeven { node { sourceUrl } }
            midImageSevenTitle
            midImageEight { node { sourceUrl } }
            midImageEightTitle

            fourmidTitle
            fourtitleone
            fourtitletwo
            fourtext

            threeConent {
              lftimage { node { sourceUrl } }
              threincontent {
                threintitle
                threincontent
                tagList
              }
            }
            threbottomText
            threbottomLinkText
            threbottomButtonLink

            fourtitleone
            fourtitletwo
            fourtext
            fourmidTitle

            fivetitle
            fivetext
            fivebottomTextOne
            fivebottomTextTwo
            fivebottomTextThree
            fivebottomTextFour
            fivebottomTextFive
            fivebottomTextSix

            numberList {
              number
              numtitle
            }

            qatitle
            qatext
            qaList {
              question
              answer
            }
          }
        }
      }
    }
  }
`

/** Number of cards fetched per "Load More" click. Lives here (a plain module)
 *  rather than in the `'use server'` actions file — a `'use server'` module may
 *  only export async functions, so a constant export there is a build error. */
export const BLOG_PAGE_SIZE = 9

export const GET_BLOG_PAGE = `
  query GetBlogPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_BlogPage {
          blogPageFields {
            headerTitle
            shortText
            boldText
            buttonText
            moreText
            headerBgColor
            headerBgOverlayLayer { node { sourceUrl altText } }
          }
        }
      }
    }
  }
`

export const GET_BLOG_POSTS = `
  query GetBlogPosts($first: Int!, $after: String, $language: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC }, wpmlLanguage: $language }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        uri
        date
        featuredImage { node { sourceUrl altText } }
      }
    }
  }
`

export const GET_POST_SLUGS = `
  query GetPostSlugs {
    posts(first: 200, where: { status: PUBLISH }) {
      nodes {
        uri
        databaseId
        translations {
          href
          locale
        }
      }
    }
  }
`

export const GET_POST_BY_URI = `
  query GetPostByUri($id: ID!, $idType: PostIdType!) {
    post(id: $id, idType: $idType) {
      title
      content
      date
      uri
      featuredImage { node { sourceUrl altText } }
      postFields { topBoldText }
    }
  }
`
