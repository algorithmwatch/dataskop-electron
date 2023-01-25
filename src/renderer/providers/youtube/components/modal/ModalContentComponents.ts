import About from "./content/About";
import Contact from "./content/Contact";
import ForcedLogout from "./content/ForcedLogout";
import Privacy from "./content/Privacy";
import Terms from "./content/Terms";

const ModalContentComponents: { [key: string]: any } = {
  about: About,
  contact: Contact,
  terms: Terms,
  privacy: Privacy,
  logout: ForcedLogout,
};

export default ModalContentComponents;
