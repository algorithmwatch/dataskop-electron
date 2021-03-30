import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import logo from '../static/logos/dataskop_logo.png';

export default function Base({ children }): JSX.Element {
  return (
    <section className="section">
      <div className="columns">
        <div className="column is-narrow">
          <img src={logo} style={{ width: '10rem' }} alt="Dataskop Logo" />
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
                <Link to={routes.RESULTS}>results</Link>
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
          <div
            style={{ overflow: 'scroll', height: '100%' }}
            data-tid="container"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
