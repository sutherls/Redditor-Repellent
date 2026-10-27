# Reddit Moment score — development brief

Status: proposed next feature; no scoring or automatic collapse is implemented yet.

## Purpose

Identify combinations of repetitive, dismissive, personally hostile, or moralizing delivery independently of political affiliation. A relevant comment may still contain those behaviors. Political relevance must not automatically exempt a comment from this separate category, and a controversial opinion must not itself increase its score.

The user's conceptual 0–10 display is a heuristic score, not a probability, trained model, or measurement of someone's intentions. Its weights and threshold have not been calibrated.

## Calibration material

`REDDIT_MOMENT_EXAMPLES.txt` preserves the user's supplied synthetic examples and context pairs. The 250 standalone examples describe preferences, not 250 universally correct collapse labels. Context pairs marked KEEP are protection cases; POSSIBLE FILTER CANDIDATE cases remain uncertain. Do not turn the list into an exact-phrase blacklist or treat every occurrence of a rhetorical template as grounds for collapse.

Include the supplied Tim Sweeney example in contextual evaluation: it is relevant to a dispute over political framing of AI disclosures, while the user dislikes its speculative motives, ideological framing, and personal mockery. Relevance and preferred delivery are separate questions. A deterministic implementation may reasonably return uncertain rather than manufacture confidence.

## Evidence to report

- Cliché/template evidence: repeated rhetorical structures; distinguish a familiar expression from demonstrated repetition within a thread.
- Personal attack/dismissal evidence: attacks directed at people or groups rather than their argument.
- Moral pressure evidence: shaming another person for enjoying or supporting something, especially when combined with an attack or dismissal.
- Provocation evidence: sweeping insults or declarations that dissent is illegitimate; do not claim to know intent.
- Context and substance protection: relevant explanations, concrete information, quotations, useful experiences, and counterexamples. Keyword overlap alone does not establish relevance; the word "because" alone does not establish substance.

Multiple expressions of the same signal must not count as independent evidence. A weak opener such as "Imagine…" or "It's almost like…" cannot cause a match alone. Political names, wealth, religion, identity, profanity, negativity, and disagreement alone contribute no penalty.

Unknown relevance should be displayed as unknown, not a fabricated numeric rating. Do not present unmeasured properties such as originality or performative intent as facts.

## Recommended implementation sequence

1. Build an isolated deterministic scorer and a review fixture. Show matched evidence, protection signals, a provisional score, and an uncertain outcome when appropriate. Keep automatic collapse disabled for this first evaluation step.
2. Test context pairs, useful criticism, harmless humor, quotations, and viewpoint-swapped examples. Reserve examples not used to write the rules and add unseen paraphrases. Report false positives and missed candidates separately; do not claim generalization from passing the original examples.
3. After calibration, add an independent opt-in category with sensitivity, explanation, and reveal controls. Require multiple independent signals for automatic collapse; leave uncertain comments visible. Existing filters remain independent.

Future optional AI classification could assess subtler context and paraphrases. It would need explicit configuration and privacy controls; this brief does not authorize introducing an API dependency now.
