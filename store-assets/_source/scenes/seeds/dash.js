// Scene 5: the notes dashboard with realistic notes.
window.__SEED = () => {
  const mk = (id, title, tags, url, content, urlScope = 'exact', hidden = false) => ({ id, url, content, urlScope, hidden, title, tags, x: 60, y: 120, pageX: 60, pageY: 120, width: 280, height: 220, displayMode: 'full', color: null, pinned: false });
  return {
    notes: [
      mk('1700000000001', 'Exam prep', ['study'], 'https://lumen-science.com/brain/sleep-and-memory', '<b>Exam tip:</b> review the 3 key ideas right before bed.<br>Check the sleep-spindle study for the bibliography.'),
      mk('1700000000002', 'Deployment rollback', ['work'], 'https://docs.nimbus-cloud.dev/guides/deployments', 'Rollback = <code>nimbus deploy --previous</code>. Add this to the runbook before Friday.', 'path'),
      mk('1700000000003', 'Lemon risotto', ['cooking'], 'https://greenleaf-recipes.com/lemon-risotto', 'Use less stock than the recipe says. Add lemon zest at the very end. Serves 4.', 'exact'),
      mk('1700000000004', 'Pricing page', ['feedback', 'design'], 'https://orbit-app.io/pricing', '<b>Feedback:</b> make the "Get started" button bigger and keep it above the fold.', 'domain'),
      mk('1700000000005', 'Lisbon trip', ['travel'], 'https://northwind-travel.com/lisbon/neighborhoods', 'Stay in Alfama for the old town, Baixa for trams. Book the Sintra day trip early.', 'exact'),
      mk('1700000000006', 'Reading group', ['research'], 'https://paperwise.org/library/attention-is-all-you-need', 'Re-read section 3.2 (multi-head attention). Questions for the reading group on Thursday.', 'exact'),
    ],
    rules: { hiddenUrls: ['mail.example.com', '/checkout'] },
  };
};
