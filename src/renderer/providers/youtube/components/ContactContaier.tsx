function ContactContainer() {
  return (
    <div className="border border-yellow-600 py-6 space-y-2">
      <div className="hl-xl mb-1">Bleibe auf dem Laufenden:</div>
      <div>
        Folge uns auf{" "}
        <a
          href="https://twitter.com/dataskop_net"
          className="link-blue"
          target="_blank"
          rel="noreferrer"
        >
          Twitter
        </a>{" "}
        oder{" "}
        <a
          href="https://www.facebook.com/DataSkop"
          className="link-blue"
          target="_blank"
          rel="noreferrer"
        >
          Facebook
        </a>
      </div>
    </div>
  );
}

export default ContactContainer;
