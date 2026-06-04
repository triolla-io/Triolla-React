export const GET_SERVICES_PAGE = `
  query GetServicesPage {
    page(id: "services", idType: URI) {
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
`;

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
    }`;

  const selections = uris
    .map(
      (uri, i) =>
        `    s${i}: page(id: ${JSON.stringify(uri)}, idType: URI) {${fields}\n    }`
    )
    .join("\n");

  return `query GetServiceDetails {\n${selections}\n}`;
}

export const GET_HOME_PAGE = `
  query GetHomePage {
    page(id: "/", idType: URI) {
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
`;

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
`;

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
      }
    }
  }
`;

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
`;

export const GET_CYBER_SECURITY_PAGE = `
  query GetCyberSecurityPage {
    page(id: "cyber-security", idType: URI) {
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
`;

export const GET_ABOUT_PAGE = `
  query GetAboutPage {
    page(id: "about-us", idType: URI) {
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
`;

export const GET_TECHNOLOGY_PAGE = `
  query GetTechnologyPage {
    page(id: "technology", idType: URI) {
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
`;
