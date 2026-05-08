---
title: Alignment by Control & Oversight
subtitle: null
id: control-oversight
type: session
order: 19
slidesURL: null
short_title: Control + Oversight
resources:
  - tab: Slides
    url: >-
      https://slides.com/djjr/hmia2025-control-and-oversight/embed?style=light&byline=hidden&share=hidden
---
BLURB: Organizations again: if you want something done right, keep an eye on the person doing it. But that problem of scalable oversight appears again and again.
[EDIT SLIDES](https://slides.com/djjr/hmia2025-control-and-oversight/edit)<iframe src="https://slides.com/djjr/hmia2025-control-and-oversight/embed?style=light&byline=hidden&share=hidden" width="576" height="420" title="HMIA 2025 Control and Oversight" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
## Control & Oversight

Gist: Active guardrail mechanisms.  Oversight boards, facilitators to keep things on track or resolve factual disputes, institutionalized truth tellers and telling (journalists and whistleblowers, mandatory reporters), kill switches, sandboxing (internships) where beginners can learn the craft safely or where new ideas can be tried out without endangering the system (even the original sandbox is a chance for kids to play in dirt without messing up the back yard or getting eaten by coyotes\!).  
   1. Readings  
      1. CCSNWI [Facilitating Interdisciplinary Meetings: A Practical Guide](https://www.ccsnwi.org/uploads/1/3/7/3/137370990/facilitating_interdisciplinary_meetings_guide.pdf#page=24)  
      2. Excerpts from Robert Ellickson – Order Without Law social norms and informal enforcement maintain alignment (whistleblowing, community sanctions)  
      3. FHI, etc. 2018 [The Malicious Use  of Artificial Intelligence: Forecasting, Prevention,  and Mitigation](https://arxiv.org/pdf/1802.07228) Maybe a general reference?  Some useful material in recommendations sections but could be too out there for this class. Chapter 04 Interventions ( high-level recommendations and priority areas for further research)  
      4. Camila Domonoske 2020 [Uber Whistleblower Takes On Silicon Valley, Armed With Stoic Philosophy](https://www.npr.org/2020/02/18/804501264/uber-whistleblower-takes-on-silicon-valley-armed-with-stoic-philosophy) NPR piece about [Susan Fowler](https://en.wikipedia.org/wiki/Susan_Rigetti) book *Whistle Blower*  
      5. Jenna McLaughlin 2025 [A whistleblower's disclosure details how DOGE may have taken sensitive labor data](https://www.npr.org/2025/04/15/nx-s1-5355896/doge-nlrb-elon-musk-spacex-security) NPR 7 minute listen  
      6. Baker McKenzie 2023\. [The EU Whistleblower Directive: One Year On](https://www.theemployerreport.com/2023/02/the-eu-whistleblower-directive-one-year-on/)  
      7. Hunt and Ferrario 2022 [A Review of How Whistleblowing is Studied in Software Engineering, and the Implications for Research and Practice](https://dl.acm.org/doi/10.1145/3510458.3513013) 11pp  
      8. Facebook Files. [Wikipedia](https://en.wikipedia.org/wiki/2021_Facebook_leak). [Wall Street Journal](https://www.wsj.com/articles/the-facebook-files-11631713039). [NPR](https://www.npr.org/2021/10/05/1043377310/facebook-whistleblower-frances-haugen-congress)  
      9. [The Watchdog That Didn't Bark](https://www.youtube.com/live/uOCMy3F1AKw?feature=shared) | Dean Starkman \- April 16, 2014 An hour-long video you can start at [8:02](https://www.youtube.com/live/uOCMy3F1AKw?feature=shared&t=482) or [10:28](https://www.youtube.com/live/uOCMy3F1AKw?feature=shared&t=626).  
      10. Hadfield-Menell, Dragan, Abbeel, Russell 2016 [The Off-Switch Game](https://arxiv.org/abs/1611.08219)  
      11.   
      12.   
   2. Class. Catalog examples you can find of brakes and kill switches in everyday life. "Safe word" in relationships or role-play, timeout in sports or conflict, mutual check-ins in group projects, parental override (“because I said so” in crisis), Emergency stop buttons on escalators, factory lines, or treadmills, “Stop work” authority on construction sites or labs, HR complaint channels / ombudsman, recall powers in governance, Hospital “code blue” teams – Stop all regular activity and redirect full institutional attention to a critical misalignment (a dying patient), licensure suspension / malpractice flags, Editorial kill switches in publishing, Judicial injunctions, Airplane autopilot disengage, “Are you sure?” prompts before deletion / data submission, Power button / battery pull, Rate limiting on APIs or social media posts.  
       How should whistleblowing and muckraking be regulated?  Examples of when you have been sandboxed?  (relationship to safe exploration)
# Control and Oversight

One of the concrete problems of AI safety analyzed in Amodei et al 2016 is "scalable oversight." They say "the designer may know the correct objective function \[contrast with reward hacking and side effects where the problem is not being able to specify correct objective in sufficient detail\], or at least have a method of evaluating it \[we hope for B and we have metrics that detect B well\], but it is too expensive to do so frequently \[enough to detect and intervene as behavior drifts\], leading to possible harmful behavior caused by bad extrapolations from limited samples \[because agents make mistakes when improvising in new situations\]."

It's easy in the machine intelligence context to see this in "us and them" terms. But we want to generalize. In every alignment context there is a distinction between

* an agent or sub-agent acting with partial autonomy, and  
* a collective or principal whose welfare depends on that agent’s behavior.

That relation can be human–machine (Amodei et al's focus), but it’s also:

* **Human alignment:** individuals "vs." groups (moral or social control).  
* **Organizational alignment:** managers "vs." subunits or employees, or institutions "vs." their members, or organizations "vs." the society/economy in which they are embedded.  
* **Expert alignment:** experts and professionals "vs." the publics they serve.

In each case, things may go well \- humans can be altruists, employees can drink the kool-aid, experts can become subsumed in their roles \- but the collective principal needs to implement mechanisms for when that fails (or even just to confirm that it has not failed).

Alignment talk sometimes inspires the questions "alignment with what?" or "alignment with whom?" Do we mean some a priori definition of "the good" or "human preferences"?  Where do they come from or who gets to say what they are?

I have come to think about this as follows.  If there is a collective with solidarity it will have interests that it will want its members, its subsidiary agents, and visitors to align with.

Alignment as a concept assumes that the alignment is with something outside the agent. Who has a say or ought to have a say is not the agent.

Control seems to assume an exogenous third party to the alignment dance?  

Control \- we are used to it being an abstract thing we impose.

If we can't create "good" agents then we (the rest of us in whose midst these agents are going to be allowed to roam freely) need to find ways to control them.

Under the heading "control and oversight" in my original cards I had governance structures, kill switches, whistleblowing, sandboxing, access controls.

So the basic trajectory here is: virtue failure → external oversight. What can oversight do? At the most abstract it can see agent actions (and maybe even anticipate them) and it can classify them as acceptable or not and intervene in some manner that controls the actions or their consequences.

A challenge to this scenario lies in the opacity of the agents.  In the human case we can seek alignment through the formation of conscience \- inner reflection about whether actions \- and the associated social act of confession.  The duty to externalize the internal.

In some traditions this is indirectly mediated by the idea of an omniscient (all seeing all knowing) god. Sometimes the logic is "god sees it and there will be a reckoning with god so why not do it now with your fellow mortals?"

WHY governance structures? The basic model for a governance structure is "we put something in place that can act as a governor" (see Watt's steam engine governor).

WHY kill switches? If an agent is allowed to live among us, we want the option of turning it off. What are the human equivalents of kill switches?  One is obvious: killing someone. But we also have "arrest" (=stop), cease and desist, ostracism and exile, freezing of assets, cutting off credit cards.  What else?

Sacred Texts

In the sacred texts of many traditions humans are exhorted to self-examination and confession.  Umar ibn al-Khattab radiyallahu ‘anhu, a prominent companion of the Prophet, said: "Bring yourself to account before you are taken to account (on the Day of Judgement)," and, "Weigh your deeds before your deeds are weighed." In the Epistle of James, early Christians are exhorted to "confess your sins to each other and pray for each other so that you may be healed."  In Theravada Buddhism, Uposatha days are times of renewed dedication to Dhamma practice; monks, on New Moon and Full Moon days engage in fortnightly confession and recitation of the Bhikkhu Patimokkha (monastic rules of conduct). In the ten days between Rosh Hashanah and Yom Kippur, each person is expected to review their own actions of the past year, acknowledge wrongs, and make amends. In the Yoga Sutras, Satya is the second Yama (ethical restraints) emphasizes the importance of truthfulness in our thoughts, words, and actions, being honest with ourselves and others, fostering a sense of integrity and authenticity that permeates all aspects of our lives. The Karma principle reminds us that our actions and our intentions come back around to affect our life.  And in Buddhism, Remonstrance, or jian (見), is the Confucian concept of a minister's duty to morally and courageously criticize a ruler, even to the point of speaking truth to power, to help the ruler remain virtuous and serve the state well.

Each of these can be read as an exhortation to externalize the opaque. The only witnesses to our inner lives are ourselves.


| Stage | Mechanism | Alignment Pathology | Example Remedy |
| ----- | ----- | ----- | ----- |
| **Virtue** | Internalized dispositions (honesty, integrity) | *Drift*: virtues fail under temptation or bias or defects in practical wisdom | Moral cultivation, conscience |
| **External Oversight** | Monitoring, audits, regulation | *Opacity*: too much inside knowledge hidden from view | Governance, transparency |
| **Internal Oversight** *(Whistleblowing from within)* | Internalized second-order monitor that observes and reports one’s own misalignment | *Self-deception*: failure of self-knowledge | Confession, self-critique, “speaking truth to oneself” |
| **Internal Oversight** *(Whistleblowing)* | Second-order monitor that observes and reports from inside opaque context | *"Loyalty" and internal control of information* | Whistleblower protections |

EXERCISE

Imagine building an AI that could confess in the style of one of these human cultivations of conscience. What would confession look like computationally?

Compare confession, transparency, and getting caught.

When does self-reporting become self-punishment or just PR?

What are the human precedents for designing internal auditors? Moral? Spiritual? Psychologica.

1. Gist: Active guardrail mechanisms.  Oversight boards, facilitators to keep things on track or resolve factual disputes, institutionalized truth tellers and telling (journalists and whistleblowers, mandatory reporters), kill switches, sandboxing (internships) where beginners can learn the craft safely or where new ideas can be tried out without endangering the system (even the original sandbox is a chance for kids to play in dirt without messing up the back yard or getting eaten by coyotes\!).  
   2. Readings  
      1. CCSNWI [Facilitating Interdisciplinary Meetings: A Practical Guide](https://www.ccsnwi.org/uploads/1/3/7/3/137370990/facilitating_interdisciplinary_meetings_guide.pdf#page=24)  
      2. Excerpts from Robert Ellickson – Order Without Law social norms and informal enforcement maintain alignment (whistleblowing, community sanctions)  
      3. FHI, etc. 2018 [The Malicious Use  of Artificial Intelligence: Forecasting, Prevention,  and Mitigation](https://arxiv.org/pdf/1802.07228) Maybe a general reference?  Some useful material in recommendations sections but could be too out there for this class. Chapter 04 Interventions ( high-level recommendations and priority areas for further research)  
      4. Camila Domonoske 2020 [Uber Whistleblower Takes On Silicon Valley, Armed With Stoic Philosophy](https://www.npr.org/2020/02/18/804501264/uber-whistleblower-takes-on-silicon-valley-armed-with-stoic-philosophy) NPR piece about [Susan Fowler](https://en.wikipedia.org/wiki/Susan_Rigetti) book *Whistle Blower*  
      5. Jenna McLaughlin 2025 [A whistleblower's disclosure details how DOGE may have taken sensitive labor data](https://www.npr.org/2025/04/15/nx-s1-5355896/doge-nlrb-elon-musk-spacex-security) NPR 7 minute listen  
      6. Baker McKenzie 2023\. [The EU Whistleblower Directive: One Year On](https://www.theemployerreport.com/2023/02/the-eu-whistleblower-directive-one-year-on/)  
      7. Hunt and Ferrario 2022 [A Review of How Whistleblowing is Studied in Software Engineering, and the Implications for Research and Practice](https://dl.acm.org/doi/10.1145/3510458.3513013) 11pp  
      8. Facebook Files. [Wikipedia](https://en.wikipedia.org/wiki/2021_Facebook_leak). [Wall Street Journal](https://www.wsj.com/articles/the-facebook-files-11631713039). [NPR](https://www.npr.org/2021/10/05/1043377310/facebook-whistleblower-frances-haugen-congress)  
      9. [The Watchdog That Didn't Bark](https://www.youtube.com/live/uOCMy3F1AKw?feature=shared) | Dean Starkman \- April 16, 2014 An hour-long video you can start at [8:02](https://www.youtube.com/live/uOCMy3F1AKw?feature=shared&t=482) or [10:28](https://www.youtube.com/live/uOCMy3F1AKw?feature=shared&t=626).  
      10. Hadfield-Menell, Dragan, Abbeel, Russell 2016 [The Off-Switch Game](https://arxiv.org/abs/1611.08219)  
      11.   
      12.   
   3. Class. Catalog examples you can find of brakes and kill switches in everyday life. "Safe word" in relationships or role-play, timeout in sports or conflict, mutual check-ins in group projects, parental override (“because I said so” in crisis), Emergency stop buttons on escalators, factory lines, or treadmills, “Stop work” authority on construction sites or labs, HR complaint channels / ombudsman, recall powers in governance, Hospital “code blue” teams – Stop all regular activity and redirect full institutional attention to a critical misalignment (a dying patient), licensure suspension / malpractice flags, Editorial kill switches in publishing, Judicial injunctions, Airplane autopilot disengage, “Are you sure?” prompts before deletion / data submission, Power button / battery pull, Rate limiting on APIs or social media posts.  
      How should whistleblowing and muckraking be regulated?  Examples of when you have been sandboxed?  (relationship to safe exploration)