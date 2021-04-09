import React from 'react';
import Base from '../layouts/Base';
import logo from '../static/logos/dataskop_logo.png';

export default function HomePage(): JSX.Element {
  return (
    <Base>
      <h2>Home</h2>
      <div>
        <img src={logo} style={{ width: '10rem' }} alt="Dataskop Logo" />
      </div>
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
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam fugit
        laboriosam suscipit fuga omnis error asperiores minus! In, ratione
        perferendis sequi libero laborum esse soluta, ut rerum placeat
        consectetur deleniti.
      </p>
    </Base>
  );
}
