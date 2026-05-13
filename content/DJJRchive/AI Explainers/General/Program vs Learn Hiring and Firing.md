---
created: 2026-05-13 14:35
updated: 2026-05-13 14:35
tags:
publish: "true"
---

# Program vs Learn Hiring and Firing

Consider work in different industries. Anna works in HR for a rapidly growing tech company. Zelda works for the army. Their bosses gave them each a job. Anna: "use this data to help me figure out what we should be paying people in various jobs." Zelda: "use this data to come up with a formula for targeting this new artillery weapon."

Anna could approach this in two ways. She cleans up the industry data (about income, job titles and descriptions, experience, education, geography and various demographic values) and, in one world, writes some code in R that calculates the mean salaries of different subgroups and make easy to read tables and charts that allow us to make comparisons.  Then she uses regression to investigate relationships that look promising - eventually she arrives at a formula that maps job descriptions and titles to salary via credential variables.  In a second world she asks the machine to find a way to predict salary based on the industry data. Anna asked the model to learn what the industry pays. But she wanted it to learn what her company should pay. Those are not the same question, and the model cannot tell the difference.

Meanwhile, Zelda sits down in one world and uses physics and math and works out formulas that generate appropriate firing coordinates taking into account properties of the weapon, temperature, wind, elevation, weapon location, and target location.  In Zelda's other world, she takes data from 10,000 test firings and asks the machine to build a model that will aim the weapon on a given target given current conditions.

What do we have here? Same cognitive move, different domains, different implications.  Each example shows the _same task_ approached two ways. For the income example many of us probably already have intuitions about salaries that may incline us to think the machine learning approach would be fairer, or not. In the artillery example something different is going on: we have an explicit formula derived from robust, well understood science, so we might wonder whether a learned model can outperform it and if so, what we should make of it.

Consider the artillery case: the formula captures known physics; the learned model might capture things the formula misses such as barrel wear, atmospheric micro-variation, manufacturing tolerances. There is a _theory vs. empiricism_ angle here. ML often works by absorbing residual complexity that our theories haven't captured yet.

And how about the salaries?  The regression-based formula might feel right because we only put into the regression things that are legitimate (even if we knew the height and weight of people in various jobs, we'd never use that to calculate their salary).  But the ML model might do a much better job and it won't be based on a priori ideas we have about the supply and demand for labor. It is likely to do a better job at finding out what predicts salary in our industry. But maybe this is not the actual task we wanted to accomplish which was find what _should_ determine the salaries we offer.

And what about failure modes here?  When the physics-based artillery formula fails we can systematically investigate whether any of the data input sensors were inaccurate. For the ML case, we might not know where to start looking. In the salary case, individual errors surface immediately (a candidate pushes back, you can investigate and adjust), but systematic errors may be invisible for years. Underpaying every woman we hire doesn't produce a single dramatic failure, it produces thousands of quiet ones, a different and perhaps more dangerous failure mode than the artillery case. And even if Anna removes gender from the model's features to correct for this, the model often reconstructs it through proxies: zip code, employment gaps, job title granularity.

Summary

||Explicit Program|Learned Model|
|---|---|---|
|**What you give it**|Instructions|Examples + objective|
| **What can corrupt it** | Garbage in, garbage out | Historical bias; distribution shift |
|**What it produces**|Deterministic output|Statistical prediction|
|**Why it works**|You encoded the logic|It found the pattern|
|**How it fails**|Predictably, traceably|Opaquely, and sometimes silently for years |
|**Who's responsible**[^1]|The programmer|… unclear|

Both learned models can take into account things humans would miss. But at a risk.  The learned salary model doesn't introduce bias but rather _inherits and perpetuates_ social bias that was already in the data.[^2] The learned artillery model doesn't inherit social bias, but it does inherit the _conditions of its training data_. If all 10,000 test firings happened at moderate temperatures, the model may fail silently in arctic conditions.[^3]  And when the quiet failures eventually surface, it becomes genuinely unclear where responsibility lies.

[^1]: This will turn out to be a really important question. Many real world structures obscure where responsibility lies.  Both bureaucracy and machine learning (ML) diffuse responsibility in ways that make it hard to locate after the fact. But they do it differently: Bureaucracy distributes responsibility across _people and procedures_, "just obeying orders...." ML distributes it across _data and weights_ — the model "found" the pattern, no one encoded the injustice. The banality of evil argument that great harms can be produced by people who are each just doing their jobs maps uncomfortably well onto ML pipelines.

[^2]: We'd call this historical bias: the model fails because its training data encoded past injustice and this gets encoded into the model rather than explicitly ruled out, as a human analyst might choose to do.

[^3]: This one we will call distribution shift. The model fails because deployment conditions differ from training conditions and it fails to generalize what it learned.
