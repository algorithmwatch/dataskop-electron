import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import logo from '../static/images/dataskop_logo.png';
import styles from './Base.css';

export default function Base({ children }): JSX.Element {
  return (
    <section className="section">
      <div className="columns">
        <div className="column is-narrow">
          <img src={logo} className={styles.logo} alt="Dataskop Logo" />
          <aside className="menu">
            <p className="menu-label">Introduction</p>
            <ul className="menu-list">
              <li>
                <Link to={routes.HOME}>home</Link>
              </li>
              <li>
                <Link to={routes.SCRAPING}>scraping</Link>
              </li>
              <li>
                <Link to={routes.VISUALIZATION}>visualization</Link>
              </li>
            </ul>
            <p className="menu-label">More Information</p>
            <ul className="menu-list">
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://algorithmwatch.org/en/project/dataskop/"
                >
                  About DataSkop
                </a>
              </li>
            </ul>
          </aside>
        </div>
        <div className="column" style={{ height: '100vh' }}>
          <div className={styles.container} data-tid="container">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
