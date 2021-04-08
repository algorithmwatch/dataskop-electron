const postDummyBackend = async (data, version, sessionId) => {
  // calling in renderer process, so fetch is available
  const res = await fetch(
    'https://lab1.algorithmwatch.org/pushdataOP1MP0Unv0H84ZENIgMA',
    {
      method: 'POST',
      body: JSON.stringify({
        version,
        sessionId,
        slug: data.slug,
        data: JSON.stringify(data),
      }),
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const json = await res.json();
  return json.success;
};

export { postDummyBackend };
