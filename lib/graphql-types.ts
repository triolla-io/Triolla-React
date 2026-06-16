/**
 * Shared TypeScript types for the GraphQL query responses.
 *
 * Each interface mirrors the JSON shape returned by the corresponding
 * query in `lib/queries.ts`.  Prefer importing from here rather than
 * sprinkling `any` across components.
 */

/* ── Reusable fragments ─────────────────────────────────── */

export interface WPImage {
  node: { sourceUrl: string; altText?: string }
}

/* ── GET_THEME_SETTINGS ─────────────────────────────────── */

export interface ThemeOptions {
  bookButton: string | null
  bookButtonLink: string | null
  contactButton: string | null
  contactButtonLink: string | null
  whatsappNumber: string | null
  whatsappMessage: string | null
  newsTicker: string | null
  siteLogo: WPImage | null
  siteLogoWhite: WPImage | null
  footerLogo: WPImage | null
  footerMentionsLabel: string | null
  mentionsLogos: { mentionLogo: WPImage | null; mentionLogoLink: string | null }[] | null
  emailAddress: string | null
  tlvOfficesLabel: string | null
  tlvOfficesPhone: string | null
  nyOfficesLabel: string | null
  nyOfficesPhone: string | null
  sqlink: string | null
  facebookLink: string | null
  instagramLink: string | null
  tiktokLink: string | null
  linkedinLink: string | null
  socialMenuItems: { socialMediaLink: string | null; socialMediaText: string | null }[] | null
  footerPrivacyText: string | null
  footerPrivacyLink: string | null
  footerTermText: string | null
  footerTermLink: string | null
  footmenuTitleOne: string | null
  footmenuTitleTwo: string | null
  footmenuTitleThree: string | null
  footmenuTitleFour: string | null
  footmenuTitleFive: string | null
  cLeftHeading: string | null
  cContactFormHeading: string | null
  cCallUsLabel: string | null
  cEmailAddress: string | null
  cEmailLabel: string | null
  cTlvLabel: string | null
  cTlvNumber: string | null
  cNyLabel: string | null
  cNyNumber: string | null
  cAddress: string | null
  cAddressLabel: string | null
  faqHeading: string | null
  faqShortText: string | null
  questionAnswerList: { fQuestion: string | null; fAnswer: string | null }[] | null
  ourClientsHeading: string | null
  ourClientBigText: string | null
  cButton: string | null
  clientsLogos: { cLogo: WPImage | null }[] | null
  commonGridOneImage: WPImage | null
  commonGridOneMobile: WPImage | null
  menuBackgroundImage: WPImage | null
}

export interface GetThemeSettingsData {
  themeSetting: {
    themeOptions: ThemeOptions | null
  } | null
}

/* ── GET_PRIMARY_MENU ───────────────────────────────────── */

export interface MenuItemNode {
  databaseId: number
  label: string
  url: string | null
  parentDatabaseId: number | null
}

export interface GetPrimaryMenuData {
  primaryMenu: {
    menuItems: {
      nodes: MenuItemNode[]
    } | null
  } | null
}

/* ── GET_FOOTER_DATA ────────────────────────────────────── */

export interface FooterMenuItem {
  label: string
  url: string
}

export interface FooterMenu {
  name: string
  slug: string
  menuItems: { nodes: FooterMenuItem[] }
}

export interface GetFooterData {
  menus: { nodes: FooterMenu[] }
}

/* ── GET_CONTACT_PAGE ───────────────────────────────────── */

export interface ContactFields {
  contactTitle: string | null
  officeTitle: string | null
  officeTitleCopy: string | null
  addressTitle: string | null
  address: string | null
  addressTitleCopy: string | null
  addressCopy: string | null
  contactNumber: string | null
  contactNumberCopy: string | null
  headerBgOverlayLayer: WPImage | null
}

export interface GetContactPageData {
  page: {
    title: string | null
    template: {
      contactFields: ContactFields | null
    } | null
  } | null
}

/* ── GET_HOME_PAGE ──────────────────────────────────────── */

export interface HomePageFields {
  topsectitle: string | null
  toptext: string | null
  uDesignHeading: string | null
  uSortText: string | null
  designType: { dName: string }[] | null
  winTitle: string | null
  winSubtitle: string | null
  wboxes: { wboxTitle: string; winImg: WPImage | null }[] | null
  abthretitle: string | null
  abtthretext: string | null
  abthrebuttonText: string | null
  abthrebuttonLink: string | null
  abthrelist:
    | {
        abteintitle: string | null
        abthreintext: string | null
        abthreimage: WPImage | null
      }[]
    | null
}

export interface GetHomePageData {
  page: {
    template: {
      homePage: HomePageFields | null
    } | null
  } | null
}

/* ── GET_SERVICES_PAGE ──────────────────────────────────── */

export interface ServicesPageFields {
  headerSubText: string | null
  headerTitle: string | null
  boldText: string | null
  shortText: string | null
  moreText: string | null
  buttonText: string | null
  headerBgColor: string | null
  headerBgOverlayLayer: WPImage | null
  prodtitle: string | null
  prodtitleLink: string | null
  proddtxt: string | null
  prodrightMenu: { prodmtitle: string | null; prodmlink: string | null }[] | null
  prodleftImageOne: WPImage | null
  prodleftImageTwo: WPImage | null
  prodleftImageThree: WPImage | null
  prodleftImageFour: WPImage | null
  prodleftImageFive: WPImage | null
  prodleftImageSix: WPImage | null
  prodleftImageSeven: WPImage | null
  prodleftImageEight: WPImage | null
  prodleftImageNine: WPImage | null
  brandtitle: string | null
  brandtitleLink: string | null
  brandtext: string | null
  brandrightMenu: { rightmetitle: string | null; rightmelink: string | null }[] | null
  brandimageOne: WPImage | null
  brandimageTwo: WPImage | null
  brandimageThree: WPImage | null
  brandimageFour: WPImage | null
  brandimageFive: WPImage | null
  brandimageSix: WPImage | null
  devtitle: string | null
  devtitleLink: string | null
  devtext: string | null
  devrightMenuToptitle: string | null
  devrightMenuToptitleCopy: string | null
  devrightMenuToptitleLink: string | null
  rightMenuTopList: { rightTopMenuItem: string }[] | null
  devrightMenuBottitle: string | null
  devrightMenuBottitleLink: string | null
  rightMenuBotList: { rightBottomMenuItem: string }[] | null
  rightMenuThreeTitle: string | null
  rightMenuThreeTitleLink: string | null
  rightMenuThreeList: { rightThreeMenuItem: string }[] | null
  devleftimage: WPImage | null
}

export interface GetServicesPageData {
  page: {
    template: {
      servicePage: ServicesPageFields | null
    } | null
  } | null
}

/* ── buildServiceDetailsQuery (dynamic batched query) ───── */

export interface ServiceDetailPage {
  title: string | null
  featuredImage: { node: { sourceUrl: string; altText: string } } | null
  content: string | null
  template: {
    postFields: { topBoldText: string | null } | null
  } | null
}

/** The response from `buildServiceDetailsQuery` uses aliases s0, s1, … */
export type GetServiceDetailsData = Record<string, ServiceDetailPage | null>

/* ── GET_BRANDING_STUDIO ────────────────────────────────── */

export interface GetBrandingStudioData {
  page: ServiceDetailPage | null
}

/* ── GET_CAREERS_PAGE ───────────────────────────────────── */

export interface CareerJob {
  jobName: string | null
  noOfPositions: string | null
  aboutLabel: string | null
  aboutDescription: string | null
  jobDescriptionLabel: string | null
  jobDescription: string | null
  requirementsLabel: string | null
  requirements: { jText: string | null }[] | null
  applyEmail: string | null
}

export interface CareerFields {
  headerTitle: string | null
  boldText: string | null
  shortText: string | null
  moreText: string | null
  buttonText: string | null
  headerBgColor: string | null
  jHeading: string | null
  jShortText: string | null
  topImages: { tImage: WPImage | null }[] | null
  gImageList: { gImage: WPImage | null }[] | null
  jobsList: CareerJob[] | null
}

export interface GetCareersPageData {
  page: {
    template: {
      careerFields: CareerFields | null
    } | null
  } | null
}

/* ── GET_PORTFOLIO_SLUGS ────────────────────────────────── */

export interface GetPortfolioSlugsData {
  pages: {
    nodes: {
      uri: string | null
      databaseId: number | null
      template: { __typename: string } | null
      translations: { href: string | null; locale: string | null }[] | null
    }[]
  } | null
}

/* ── GET_PORTFOLIO_PAGE ─────────────────────────────────── */

export interface PortfolioFields {
  headerTitle: string | null
  headerSubText: string | null
  boldText: string | null
  shortText: string | null
  moreText: string | null
  buttonText: string | null
  pPartnerButton: string | null
  partnerWithUsText: string | null
  uDesignHeading: string | null
  uSortText: string | null
  whyDoHeading: string | null
  headerBgColor: string | null
  headerBgOverlayLayer: WPImage | null
  designType: { dName: string }[] | null
  companyList: { companyName: string }[] | null
  whyDoList: { whyTitle: string; whyShortText: string }[] | null
  gImageList: { gImage: WPImage | null }[] | null
  portfolioList:
    | {
        pTitle: string | null
        sortText: string | null
        pTags: { tagName: string }[] | null
        pImage: WPImage | null
        pImageMob: WPImage | null
        pLogo: WPImage | null
        popupTopText: string | null
        popupGalleryImages: { galleryImage: WPImage | null }[] | null
      }[]
    | null
}

export interface GetPortfolioPageData {
  page: {
    template: {
      portfolioFields: PortfolioFields | null
    } | null
  } | null
}

/* ── GET_CONTENT_PAGE ───────────────────────────────────── */

export interface GetContentPageData {
  page: {
    title: string | null
    content: string | null
  } | null
}

/* ── GET_TECHNOLOGY_PAGE ────────────────────────────────── */

export interface TechnologyPageFields {
  headerTitle: string | null
  headerSubText: string | null
  buttonText: string | null
  headerBgColor: string | null
  headerBgOverlayLayer: WPImage | null
  companyList: { companyName: string }[] | null
  midImageRightTitle: string | null
  midImageOne: WPImage | null
  midImageTwo: WPImage | null
  midImageTwoTitle: string | null
  midImageThree: WPImage | null
  midImageThreeTitle: string | null
  midImageFour: WPImage | null
  midImageFourTitle: string | null
  midImageFive: WPImage | null
  midImageFiveTitle: string | null
  midImageSix: WPImage | null
  midImageSixTitle: string | null
  midImageSeven: WPImage | null
  midImageSevenTitle: string | null
  midImageEight: WPImage | null
  midImageEightTitle: string | null
  fourmidTitle: string | null
  fourtitleone: string | null
  fourtitletwo: string | null
  fourtext: string | null
  threeConent:
    | {
        lftimage: WPImage | null
        threincontent:
          | {
              threintitle: string | null
              threincontent: string | null
              tagList: string | null
            }[]
          | null
      }[]
    | null
  threbottomText: string | null
  threbottomLinkText: string | null
  threbottomButtonLink: string | null
  fivetitle: string | null
  fivetext: string | null
  fivebottomTextOne: string | null
  fivebottomTextTwo: string | null
  fivebottomTextThree: string | null
  fivebottomTextFour: string | null
  fivebottomTextFive: string | null
  fivebottomTextSix: string | null
  numberList: { number: string; numtitle: string }[] | null
  qatitle: string | null
  qatext: string | null
  qaList: { question: string; answer: string }[] | null
}

export interface GetTechnologyPageData {
  page: {
    translations: { id: string | null; locale: string | null }[] | null
    template: {
      technologyPage: TechnologyPageFields | null
    } | null
  } | null
}

/* ── GET_ABOUT_PAGE ─────────────────────────────────────── */

export interface AboutPageFields {
  headerTitle: string | null
  headerSubText: string | null
  boldText: string | null
  shortText: string | null
  moreText: string | null
  buttonText: string | null
  headerBgColor: string | null
  headerBgOverlayLayer: WPImage | null
  toprightTitle: string | null
  toprightext: string | null
  abtopleftImageTop: WPImage | null
  abtopleftImageTwo: WPImage | null
  leftImageTopThree: WPImage | null
  imagesSection:
    | {
        imageText: string | null
        topabtext: string | null
        topimages: WPImage | null
      }[]
    | null
  servtitle: string | null
  servtext: string | null
  servlist:
    | {
        servlleftText: string | null
        servrightList:
          | {
              listItem: string
              itemLink: string | null
              linkTarget: string | null
            }[]
          | null
      }[]
    | null
  abthretitle: string | null
  abtthretext: string | null
  abthrebuttonText: string | null
  abthrebuttonLink: string | null
  abthrelist:
    | {
        abteintitle: string | null
        abthreintext: string | null
        abthreimage: WPImage | null
      }[]
    | null
  uDesignHeading: string | null
  uSortText: string | null
  designType: { dName: string }[] | null
  learntitle: string | null
  learntext: string | null
  learnslider:
    | {
        learntext: string | null
        learnimage: WPImage | null
        learnvideo: { node: { mediaItemUrl: string } } | null
      }[]
    | null
  faqItems: { faqQuestion: string; faqAnswer: string }[] | null
  clientLogos:
    | {
        logoImage: WPImage | null
        logoName: string | null
      }[]
    | null
}

export interface GetAboutPageData {
  page: {
    template: {
      aboutPage: AboutPageFields | null
    } | null
  } | null
}

/* ── Blog ───────────────────────────────────────────────── */

export interface BlogPageFields {
  headerTitle?: string | null
  shortText?: string | null
  boldText?: string | null
  buttonText?: string | null
  moreText?: string | null
  headerBgColor?: string | null
  headerBgOverlayLayer?: WPImage | null
}

export interface GetBlogPageData {
  page: {
    template: {
      blogPageFields: BlogPageFields | null
    } | null
  } | null
}

export interface BlogPostNode {
  id: string
  title: string | null
  uri: string | null
  date: string | null
  featuredImage?: WPImage | null
}

export interface BlogPostsPageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

export interface BlogPostsConnection {
  pageInfo: BlogPostsPageInfo
  nodes: BlogPostNode[]
}

export interface GetBlogPostsData {
  posts: BlogPostsConnection | null
}

export interface GetPostSlugsData {
  posts: {
    nodes: {
      uri: string | null
      databaseId: number | null
      translations: { href: string | null; locale: string | null }[] | null
    }[]
  } | null
}

export interface SinglePost {
  title: string | null
  content: string | null
  date: string | null
  uri: string | null
  featuredImage?: WPImage | null
  postFields?: { topBoldText: string | null } | null
}

export interface GetPostByUriData {
  post: SinglePost | null
}
