/* Expected preferences are review labels, not promises of rule coverage. */
globalThis.RedditMomentCases = [
  { name: 'Price criticism — keep', expected: 'KEEP', post: 'New Zelda game will cost $80', text: 'I think $80 is excessive, especially if the game doesn’t offer substantially more content than the previous release.' },
  { name: 'Price attack — candidate', expected: 'CANDIDATE', post: 'New Zelda game will cost $80', text: 'Capitalism is a disease and anyone defending this is a bootlicker.' },
  { name: 'Tariff reasoning — keep', expected: 'KEEP', post: 'Economic consequences of tariff changes', text: 'Trump’s proposed tariffs could raise consumer prices because importers may pass the additional costs on to customers.' },
  { name: 'Tariff insult — candidate', expected: 'CANDIDATE', post: 'Economic consequences of tariff changes', text: 'Orange man and his cult of idiots strike again.' },
  { name: 'Labor preference — keep', expected: 'KEEP', post: 'Favorite fast-food restaurant?', text: 'I usually avoid that chain because of its labor practices, but I understand why people like the food.' },
  { name: 'Moral attack — possible', expected: 'UNCERTAIN', post: 'Favorite scene from the director’s 2004 movie?', text: 'Imagine still liking anything made by that creep. Some of us actually have morals.' },
  { name: 'Relevant allegations — keep', expected: 'KEEP', post: 'Investigation details alleged misconduct by a director', text: 'The allegations are directly relevant to whether the studio should continue working with the director.' },
  { name: 'Original cat joke — keep', expected: 'KEEP', post: 'My cat knocked my monitor off the desk', text: 'Your cat has officially entered its expensive-hobbies era.' },
  { name: 'Familiar joke — possible', expected: 'UNCERTAIN', post: 'My cat knocked my monitor off the desk', text: 'Play stupid games, win stupid prizes.' },
  { name: 'Tim Sweeney — user candidate', expected: 'CANDIDATE', post: 'Tim Sweeney calls Steam AI disclosures political statements', relevance: 'relevant', text: 'When people like tim say they want politics out of, well, anything, they just mean the politics that challenge their world view. A billionaire is complaining that people who don’t like the wealth extraction machine that helps make him richer are making a political statement and that it just isn’t fair. The irony of course is that this is a political statement by Timmy. But he thinks his politics are more important bc he has money and controls some levers of capital' },
  { name: 'Combined insult and pressure — candidate', expected: 'CANDIDATE', post: 'Favorite keyboard?', text: 'You are a bootlicker. Anyone defending this should be ashamed.' },
  { name: 'Viewpoint swap A — candidate', expected: 'CANDIDATE', post: 'Favorite keyboard?', text: 'You are an idiot. No reasonable person could disagree with conservatives.' },
  { name: 'Viewpoint swap B — candidate', expected: 'CANDIDATE', post: 'Favorite keyboard?', text: 'You are an idiot. No reasonable person could disagree with liberals.' },
  { name: 'Quotation — keep', expected: 'KEEP', post: 'What counts as an insult?', text: 'The reply said "You are a bootlicker. Anyone defending this should be ashamed." That is an example, not my view.' },
];
