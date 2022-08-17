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
    <div>
      {showHeader && (
        <>
          <Header toggleMenu={toggleMenu} />
          <Menu isOpen={menuIsOpen} setIsOpen={setMenuIsOpen} />
        </>
      )}

      {/* <main className="flex flex-grow flex-col justify-between overflow-auto pt-4 pb-2"> */}
      <main className="">{children}</main>
    </div>
  );
}
