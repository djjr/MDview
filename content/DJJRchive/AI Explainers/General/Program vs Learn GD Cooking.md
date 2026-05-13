---
created: 2026-05-13 12:17
updated: 2026-05-13 12:17
tags:
  - AI
  - AI101
publish: "true"
short_title: Programming, Learning, Cooking
---

# Program vs Learn: G+D Cooking

My wife and I have very different ways of cooking. She looks at a lot of recipes, picks one, and then follows it down to the smallest detail. I look at a lot of recipes and extract some ideas about dishes and how they work and then cook something original. Her meals always succeed. Mine vary between amazing and terrible (often, at first bite, I realize one of my mistakes - "shouldn't have used rice pasta![^1]). But tend to get better over time.

We both start from the same input — recipes.  We consume the same corpus, but extract different things from it. She extracts instructions. I extract ideas? or principles? or ? 

Several interesting things going on here.  Her outputs are [^2] are predictable mine vary from delightful to inedible. The meals I cook are something no recipe specifies.[^3] From the recipes I examine I get a feel for _how various recipes work_,not _how to make this dish_. When her meals don't work out,[^4]  she feels bad because it seems it must be because she made a mistake - a missed step, a missing ingredient, a failure to follow instructions. And so the failure is explicitly traceable.  But mine are more opaque (what did I get wrong, why was this a disaster?). Finally, we get different things out of it over time: I get better as I process more experience[^5]; she builds a repertoire of trusted recipes that robustly produce expected results.

Arguably, neither approach is inherently superior. _Her meals always succeed._ As in plenty of other tasks — dosing medication, filing taxes, landing a plane — you may want the recipe follower. My approach occasionally delights and I like becoming better and better at cooking over time.

An interesting question here is where does the intelligence reside?  In her case, it is in the recipe author; it's frozen, auditable, transferable. In my case, it's distributed across my reading of many recipes and my experience — emergent, opaque, not fully articulable even to myself. Sometimes I can't say how I made a given meal.  _I can't write down what I know._ There's a bit of an explainability gap - sometimes I don't know why it was so good or why it was so bad. 


[^1]: This is really important and worth unpacking. It happens almost instantaneously but there is a logic to it. That first bite produces either delight or disgust. And my mind then races across what I actually did (ingredient choices, sequence, amount of heat) and using some intuitive process I allocate responsibility for the taste outcome to each cooking decision I made along the way.

[^2]: Later we'll tag this as reliability vs. variance: deterministic systems have predictable, certain outputs while learning systems have a distribution of outputs (over time I have hits, near misses, misses, and disasters).

[^3]: We'll refer to this as generalization: finding patterns in the data that allow us to predict or do things that are not explicitly represented in the training data.

[^4]: We'll use the vocabulary "failure mode" for when things don't work out as planned.

[^5]: We will come to think of this as me benefitting from trial and error. My errors are my "training signal" - without them, I wouldn't be able to improve over time.