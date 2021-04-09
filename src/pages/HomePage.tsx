import React from 'react';
import Base from '../layouts/Base';
import logo from '../static/logos/dataskop_logo.png';

export default function HomePage(): JSX.Element {
  return (
    <Base>
      <>
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md mb-10">
          <div>
            <div className="text-xl font-medium text-black">Onboarding</div>
            <p className="text-gray-500">
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam
                fugit laboriosam suscipit fuga omnis error asperiores minus! In,
                ratione perferendis sequi libero laborum esse soluta, ut rerum
                placeat consectetur deleniti.
              </p>
            </p>
          </div>
          <div>
            <img src={logo} style={{ width: '10rem' }} alt="Dataskop Logo" />
          </div>
        </div>
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
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
        </div>
      </>
    </Base>
  );
}
