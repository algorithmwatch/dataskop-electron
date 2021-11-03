import { faCheckCircle } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContactContainer from '../components/ContactContaier';
import ContentWrapper from '../components/ContentWrapper';

export default function DonationSuccessPage(): JSX.Element {
  // const { getPreviousPage } = useNavigation();
  // const footerNavItems: FooterNavItem[] = [
  //   {
  //     label: 'Zurück',
  //     theme: 'link',
  //     startIcon: faAngleLeft,
  //     clickHandler(history: RouteComponentProps['history']) {
  //       history.push(getPreviousPage('path'));
  //     },
  //   },
  // ];

  return (
    <>
      <ContentWrapper centerY>
        <div className="text-center relative -top-16">
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="5x"
            className="text-green-600 mb-3"
          />
          <div className="hl-4xl mb-5">Vielen Dank für deine Spende!</div>

          <div className="space-y-6 text-lg max-w-2xl mx-auto">
            <p>
              Bitte denke daran, für das DataSkop-Konto deine E-Mailadresse zu
              bestätigen.
            </p>

            <ContactContainer />

            <p className="text-sm">Du kannst die Anwendung nun schließen.</p>
          </div>
        </div>
      </ContentWrapper>
      {/* <FooterNav items={footerNavItems} /> */}
    </>
  );
}
