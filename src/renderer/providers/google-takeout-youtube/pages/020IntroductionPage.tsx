/**
 * Text-heavy introductory page
 *
 * @module
 */

import ContentPage from "../../../pages/ContentPage";

const IntroductionPage = (): JSX.Element => {
  return (
    <ContentPage title="YouTube v2">
      <div className="space-y-6 text-xl max-w-prose">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro
          sapiente, voluptates laudantium ad fugiat ipsa aperiam blanditiis in,
          itaque unde at corporis, sint eos dolor rerum repellat! Ipsa,
          voluptate quibusdam.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro
          sapiente, voluptates laudantium ad fugiat ipsa aperiam blanditiis in,
          itaque unde at corporis, sint eos dolor rerum repellat! Ipsa,
          voluptate quibusdam.
        </p>
      </div>
    </ContentPage>
  );
};

export default IntroductionPage;
