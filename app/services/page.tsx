import { client } from "@/lib/apollo-client";
import { GET_SERVICES_PAGE } from "@/lib/queries";
import { gql } from "@apollo/client";

async function getServicesData() {
  const { data } = await client.query<any>({
    query: gql`${GET_SERVICES_PAGE}`,
  });
  return data.page.template.servicePage;
}

export default async function ServicesPage() {
  const sp = await getServicesData();

  const prodImages = [
    sp.prodleftImageOne?.node?.sourceUrl,
    sp.prodleftImageTwo?.node?.sourceUrl,
    sp.prodleftImageThree?.node?.sourceUrl,
    sp.prodleftImageFour?.node?.sourceUrl,
    sp.prodleftImageFive?.node?.sourceUrl,
    sp.prodleftImageSix?.node?.sourceUrl,
    sp.prodleftImageSeven?.node?.sourceUrl,
    sp.prodleftImageEight?.node?.sourceUrl,
    sp.prodleftImageNine?.node?.sourceUrl,
  ].filter(Boolean);

  const brandImages = [
    sp.brandimageOne?.node?.sourceUrl,
    sp.brandimageTwo?.node?.sourceUrl,
    sp.brandimageThree?.node?.sourceUrl,
    sp.brandimageFour?.node?.sourceUrl,
    sp.brandimageFive?.node?.sourceUrl,
    sp.brandimageSix?.node?.sourceUrl,
  ].filter(Boolean);

  return (
    <main>
      {/* Hero */}
      <section>
        <p>{sp.headerSubText}</p>
        <h1>{sp.headerTitle}</h1>
        <h2>{sp.boldText}</h2>
        <p>{sp.shortText}</p>
        <p>{sp.moreText}</p>
      </section>

      {/* Product Design */}
      <section>
        <h2>{sp.prodtitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: sp.proddtxt }} />
        <ul>
          {sp.prodrightMenu?.map((item: any) => (
            <li key={item.prodmtitle}>
              <a href={item.prodmlink}>{item.prodmtitle}</a>
            </li>
          ))}
        </ul>
        <div>
          {prodImages.map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </section>

      {/* Branding */}
      <section>
        <h2>{sp.brandtitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: sp.brandtext }} />
        <ul>
          {sp.brandrightMenu?.map((item: any) => (
            <li key={item.rightmetitle}>
              <a href={item.rightmelink}>{item.rightmetitle}</a>
            </li>
          ))}
        </ul>
        <div>
          {brandImages.map((src, i) => (
            <img key={i} src={src} alt="" />
          ))}
        </div>
      </section>

      {/* Technology */}
      <section>
        <h2>{sp.devtitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: sp.devtext }} />
        <div>
          <a href={sp.devrightMenuBottitleLink}>{sp.devrightMenuBottitle}</a>
          <ul>
            {sp.rightMenuBotList?.map((item: any) => (
              <li key={item.rightBottomMenuItem}>{item.rightBottomMenuItem}</li>
            ))}
          </ul>
          <a href={sp.rightMenuThreeTitleLink}>{sp.rightMenuThreeTitle}</a>
          <ul>
            {sp.rightMenuThreeList?.map((item: any) => (
              <li key={item.rightThreeMenuItem}>{item.rightThreeMenuItem}</li>
            ))}
          </ul>
        </div>
        <img src={sp.devleftimage?.node?.sourceUrl} alt="" />
      </section>
    </main>
  );
}