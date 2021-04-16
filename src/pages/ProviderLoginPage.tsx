import React from 'react';
import routes from '../constants/routes.json';
import SlideBase from '../layout/SlideBase';

export default function ProviderLogin(): JSX.Element {
  return (
    <SlideBase footerNav={[{ label: 'Login', to: routes.SCRAPING_ADVANCED }]}>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
      molestiae laboriosam adipisci odio molestias eligendi, illo fugit ad
      impedit repellendus nulla beatae unde quasi eaque ea consequatur
      recusandae velit necessitatibus!
    </SlideBase>
  );
}
