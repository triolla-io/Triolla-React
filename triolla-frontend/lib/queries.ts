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
          }
        }
      }
    }
  }
`;
