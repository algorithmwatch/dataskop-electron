import About from './content/About';
import Contact from './content/Contact';
import Faq from './content/Faq';
import ForcedLogout from './content/ForcedLogout';
import Privacy from './content/Privacy';
import Terms from './content/Terms';

const ModalContentComponents: { [key: string]: any } = {
  about: About,
  contact: Contact,
  faq: Faq,
  terms: Terms,
  privacy: Privacy,
  logout: ForcedLogout,
};

export default ModalContentComponents;
