import { ReactNode, useState } from "react";
import Header from "renderer/components/Header";
import { Menu } from "renderer/components/Menu";
import { useNavigation } from "renderer/contexts";

export default function BaseLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const { getCurrentPage } = useNavigation();
  const toggleMenu = () => {
    setMenuIsOpen((old) => !old);
  };
  const showHeader = getCurrentPage("layoutProps")?.showHeader || true;

  return (
    <>
      {showHeader && (
        <>
          <Header toggleMenu={toggleMenu} />
          <Menu isOpen={menuIsOpen} setIsOpen={setMenuIsOpen} />
        </>
      )}

      {/* "relative" + "z-index": header is fixed and body starts from upper border. make body overlap header */}
      <main className="relative min-h-full flex flex-col z-10">{children}</main>
    </>
  );
}
