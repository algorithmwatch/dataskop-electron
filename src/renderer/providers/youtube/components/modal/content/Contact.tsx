function About() {
  return (
    <div className="space-y-4">
      <div className="hl-3xl">Kontakt</div>
      <p>
        E-Mail:{' '}
        <a className="link-blue" href="mailto:info@dataskop.net">
          info@dataskop.net
        </a>
      </p>
      <p>
        Technischer Support:{' '}
        <a className="link-blue" href="mailto:support@dataskop.net">
          support@dataskop.net
        </a>
      </p>
      <p>
        Twitter:{' '}
        <a
          className="link-blue"
          target="_blank"
          href="https://twitter.com/dataskop_net"
          rel="noreferrer"
        >
          @dataskop_net
        </a>
      </p>
      <p>
        Mehr erfahren auf{' '}
        <a
          className="link-blue"
          target="_blank"
          href="https://dataskop.net"
          rel="noreferrer"
        >
          dataskop.net
        </a>
      </p>
    </div>
  );
}

export default About;
