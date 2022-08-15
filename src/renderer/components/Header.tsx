import clsx from 'clsx';
import { useLocation } from 'react-router';
import { useConfig, useNavigation } from 'renderer/contexts';
import logo from 'renderer/providers/tiktok/static/images/bildmarke.svg';

export default function Header() {
  const { pathname } = useLocation();
  const {
    state: { version },
  } = useConfig();
  const { getCurrentPage } = useNavigation();
  const layoutProps = getCurrentPage('layoutProps');

  return (
    <header
      className={clsx('flex items-center py-4 px-6 z-20 h-[4.375rem]', {
        'opacity-0': pathname === '/tiktok/start',
      })}
    >
      {layoutProps?.hideHeader && (
        <div>
          <img src={logo} style={{ width: '8rem' }} alt="Dataskop Logo" />
        </div>
      )}
      {version && version.includes('beta') && (
        <div className="ml-3 text-sm bg-yellow-300 px-1.5 py-0.5 text-yellow-1300">
          Beta
        </div>
      )}
      {/* <div>
        <button
          type="button"
          className="focus:outline-none text-yellow-800 hover:text-yellow-900"
          onClick={() => setMenuIsOpen(true)}
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
      </div> */}
    </header>
  );
}
