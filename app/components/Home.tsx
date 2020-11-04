import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';

import Base from './Base';

export default function Home(): JSX.Element {
  return (
    <Base>
      <h2>Home</h2>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam fugit
        laboriosam suscipit fuga omnis error asperiores minus! In, ratione
        perferendis sequi libero laborum esse soluta, ut rerum placeat
        consectetur deleniti.
      </p>
    </Base>
  );
}
