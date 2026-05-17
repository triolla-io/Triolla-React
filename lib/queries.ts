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

            prodtitle
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
            devtext
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
            # faqItems and clientLogos — uncomment once ACF fields are created in WP
            # faqItems { faqQuestion faqAnswer }
            # clientLogos { logoImage { node { sourceUrl } } logoName }
          }
        }
      }
    }
  }
`;

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
            gImageList { gImage { node { sourceUrl altText } } }
            winTitle
            winSubtitle
            wboxes { wboxTitle }
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

/**
 * Fetch global footer options from WordPress.
 * Requires the "WPGraphQL for ACF" plugin and an ACF Options page
 * registered under the field group slug "footer_options".
 * Falls back gracefully — the Footer component uses static defaults
 * if these fields are absent.
 */
export const GET_FOOTER_OPTIONS = `
  query GetFooterOptions {
    generalSettings {
      title
      url
    }
    themeGeneralSettings {
      footerOptions {
        contactEmail
        phoneTlv
        phoneNy
        whatsappUrl
        calendlyUrl
        sqLinkUrl
        sqLinkLogo { node { sourceUrl } }
        triollaLogo { node { sourceUrl } }
        socialLinks {
          platform
          url
        }
        mediaMentions {
          name
          url
          logo { node { sourceUrl } }
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
