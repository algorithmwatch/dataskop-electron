import React from 'react';

function ForcedLogout() {
  return (
    <div className="space-y-4">
      <h1 className="hl-4xl my-6">Opps, hier ist was schief gelaufen.</h1>
      <p>
        Du wurdest vorzeitig ausgeloggt. Bitte öffne deine E-Mails und
        bestätige, dass du dich auf einem neuen Gerät anmelden möchtest. (Für
        Google ist DataSkop ein neues Gerät.)
      </p>
      <p>Anschließend starte die App und melde dich erneut an.</p>
    </div>
  );
}

export default ForcedLogout;
