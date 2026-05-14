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
