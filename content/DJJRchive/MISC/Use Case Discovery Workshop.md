---
tags:
  - AI
  - cities
  - use-case
  - workshop
---
## **AI & Cities: Use Case Discovery Workshop Scenario**

A group of city officials from “Midvale City” come together for a half-day workshop on exploring AI applications for improving city services. Participants come from different departments—Public Works, Parks & Recreation, Health, Transit, Emergency Services, and Education.

### **Characters/Participants:**

- **Maria (Facilitator)**: Leading the AI brainstorming exercise.
- **Angela (Public Works)**: Works on infrastructure and maintenance issues.
- **Jamal (Transit)**: Oversees bus operations.
- **Irene (Parks & Rec)**: Manages park programming and facilities.
- **Oliver (Emergency Services)**: Coordinates ambulance and fire response.
- **Chloe (Education)**: Advises on K-12 school initiatives and adult education.
- **Sofia (IT/City Data Analyst)**: Provides data and technology support across departments.

---

## **Introduction**

Maria begins by explaining that the workshop will look at ways AI might help the city, but in a structured way that starts with broad, creative thinking and moves toward grounding the ideas in real problems and processes.

> **Maria:** "Today, we’ll explore AI use cases in city services. The challenge is that we each know our domain well, but we might not be fully aware of what AI can or can’t do. Let’s start with a structured brainstorm to spark ideas, and then we’ll dig deeper to see which ones are solutions worth prototyping.”

---

## **Step 1: Imagined Use Case Generation**

Maria shows a slide listing the five generic AI functions: **Classification**, **Prediction**, **Optimization**, **Generation**, and **Translation**. She asks each participant to propose one quick idea for each function, using a city-services lens.

> **Maria (to the group):** “Let’s take each AI function in turn. I want each of you to give me a one-sentence idea of how it might help in your area—doesn’t need to be perfect or realistic right now. The point is to get the creative juices flowing!”

Below is how the group populates their initial table of ideas:

|DOMAIN|Classify|Predict|Optimize|Translate|Generate|
|---|---|---|---|---|---|
|**Public Works** (Angela)|“Classify road surface images to identify potholes automatically.”|“Predict which roads are most likely to crack during winter freeze-thaw.”|“Optimize street repair schedules so crews minimize travel time and costs.”|“Translate resident complaints from the app directly into work orders with recommended priority.”|“Generate potential repair plans or designs for new sidewalks based on usage data.”|
|**Parks & Rec** (Irene)|“Classify feedback from park users to see what activities are most popular.”|“Predict how many visitors we’ll get at each park based on weather and holidays.”|“Optimize irrigation schedules so we don’t waste water but keep the lawns green.”|“Translate local community input into conceptual park design sketches or feature lists.”|“Generate new ideas for playground features or rec programs using AI-driven suggestions.”|
|**Health** (Chloe, bridging Education/Health)|“Classify student or family health concerns based on seriousness or topic.”|“Predict which neighborhoods might see higher flu rates in a given season.”|“Optimize school nursing staff schedules in the district.”|“Translate clinical health data into simpler language for families or students.”|“Generate targeted health campaign messages for families.”|
|**Transit** (Jamal)|“Classify real-time transit delays by type—mechanical, traffic congestion, accidents, etc.”|“Predict ridership for each bus route hour-by-hour.”|“Optimize bus routes and schedules for changing passenger demand during the day.”|“Translate complex schedule data into simpler real-time announcements for riders.”|“Generate hypothetical scenarios for new routes or service expansions.”|
|**Emergency Services** (Oliver)|“Classify 911 calls by priority or incident type using voice analysis.”|“Predict likely emergency hotspots on busy weekends or big event days.”|“Optimize how ambulances are stationed around the city in real time.”|“Translate emergency alerts into multiple languages instantly.”|“Generate training drills for first responders with realistic simulated incidents.”|
|**Education** (Chloe)|“Classify student performance data by subject or skill gap.”|“Predict which students might be at risk of dropping out.”|“Optimize teacher-class assignments for better student outcomes.”|“Translate academic research findings into plain-language advice for teachers.”|“Generate personalized learning materials or entire lesson plans.”|

Maria praises the team for their quick ideas:

> **Maria:** “Great! We now have a handful of ‘imagine if AI did X’ statements. Let’s move on to figuring out which are grounded in a _real problem_ and which might be hype for hype’s sake.”

---

## **Step 2: From Cool Ideas to Problem Insight**

Maria explains that the next step is to examine how the city currently handles the tasks at hand and identify the real bottlenecks or underlying issues.

> **Maria:** "When we say ‘Identify potholes from drone footage,’ for example, let’s not forget that the underlying problem is: _How does the city know where potholes are, and what do they do about it?_ Let’s see how each department’s idea aligns with real problems they’re facing."

### **2a. Understand the Status Quo**

Maria prompts each participant to describe how the city is currently handling the process behind one of their proposed ideas. Angela from Public Works volunteers to discuss potholes.

> **Angela (Public Works):**  
> “Right now, we mostly rely on residents to report potholes through 311 calls or the city’s website. Our crews also do scheduled inspections, but we can’t inspect every street all the time. After we get a complaint, someone from the department will check it out in person, confirm it’s a real pothole, and then put it in the repair schedule.”

> **Maria:** “Any bottlenecks or issues there?”

> **Angela:**  
> “Sure. We have limited staff, so verification is slow. Also, complaints are scattered—some neighborhoods are super active in reporting, while others are quiet. It leads to uneven responses across the city.”

Maria begins filling a table on a whiteboard:

|City Function|Task|Current Process|Bottleneck|Underlying Problem|
|---|---|---|---|---|
|Public Works|Pothole identification|Residents report via 311, followed by manual check|Reporting is sporadic; verification is time-consuming|Uneven pothole reporting & slow turnarounds for repairs|

---

### **2b. Problem Clarification**

Maria asks everyone to reflect on the underlying reasons it’s important to identify potholes efficiently.

> **Maria:** “What outcome do we want?”

> **Angela:** “We want smoother roads and to fix potholes before they cause damage or accidents. But we don’t always know where they are quickly enough.”

> **Maria:** “So it’s about better data collection and faster decision-making. Where exactly does the current process fall short?”

> **Angela:**  
> “There’s a delay between when the pothole emerges and when we find out. And even then, we need to decide which ones to fix first. It’s not just about classification; it’s about _prioritization_—which might require _prediction_ or _optimization_ for scheduling.”

**Facilitator Commentary**: Notice how Angela is now linking _classification_ (finding potholes) to _prediction_ (estimating severity or future damage) and _optimization_ (deciding repair schedules). This cross-function insight often emerges once people see that real solutions require combining different AI functions.

---

Maria encourages the others to chime in with their own areas’ status quo. Jamal from Transit picks the “delay classification” idea.

> **Jamal (Transit):**  
> “For bus delays, the drivers call or log it into our system, but the reason for a delay can be anything from traffic, a mechanical fault, weather, or just unexpected passenger volume. We have a rough manual categorization, but it’s not in real time, and we can’t easily fix problems on the fly.”

|City Function|Task|Current Process|Bottleneck|Underlying Problem|
|---|---|---|---|---|
|Transit|Delay categorization|Operators manually report cause|Inconsistent updates; no real-time classification or solutions|Lack of real-time insight into recurring or fixable delay causes|

**Facilitator Commentary**: Here, Jamal clarifies that the big need is real-time classification and subsequent operational decisions. A purely historical or manual approach slows down corrective action.

---

### **“Whys and Becauses” Exercise**

To probe deeper into the pothole problem, Maria asks Angela to articulate the chain of cause and effect.

> **Maria:** “Angela, fill in the reasons behind the slow repairs and the consequences. Let’s map a quick chain.”

Angela sketches out:

|Why?Behind this is...|Why?Behind this is...|UnsatisfactoryStatus QuoSolution|AndBecause of this...|AndBecause of this...|
|---|---|---|---|---|
|We rely on public reporting|Reporting can be sporadic or biased|We can’t systematically track all potholes|Some dangerous potholes get missed|Road quality deteriorates, angering residents|
|No automated way to confirm potholes|Not enough city inspectors|Verification takes a long time|Delays in repairs|Higher repair cost if potholes get worse|

Angela adds:

> **Angela:** “So the status quo leads to slower repairs, which lead to more driver complaints, and that hits our budget because we do more costly repairs down the line.”

**Facilitator Commentary**: This exercise highlights root causes—lack of real-time data—and effects (unhappy residents, higher costs). It reveals that the real problem is about efficient detection and prioritization, not just “using AI to see potholes.”

---

### **2c: Bottleneck Mapping**

Maria then invites the team to consider how big a bottleneck this is for the city overall.

> **Maria:** “Is this problem big enough to justify an AI solution? Or do we have bigger fish to fry? Let’s do a quick gauge—scale of 1 to 5, how painful is this?”

> **Angela:** “It’s probably a 4 for us; people really complain about potholes.”

Others nod. Irene (Parks & Rec) says her classification of park feedback might be less urgent, maybe a 2 or 3. Jamal (Transit) sees a big impact in real-time delay management, maybe a 4.

Maria concludes:

> **Maria:** “So we have a sense that pothole identification and prioritization is a high-value problem. Now we can see how AI might help fix real bottlenecks—**finding** potholes, **classifying** severity, and **optimizing** the scheduling. The next step is to figure out data readiness, resources, and feasibility.”

**Facilitator Commentary**: The team now has a clearer sense of which AI-driven ideas connect to a real need. They see that a combination of classification, prediction, and optimization may be the best approach to truly solve the underlying problem of slow pothole repair cycles.

---

## **Takeaways**

1. **Structured Brainstorming:** Listing ideas by AI function helped the group see a range of possibilities quickly.
2. **Contextualizing the Problem:** Examining how things work now (the status quo) exposed bottlenecks and clarified the problem behind each AI concept.
3. **Root-Cause Exploration:** The “Why/Because” chain highlighted that real pain points often require a combination of AI functions (e.g., classification + prediction + scheduling optimization).
4. **Value Assessment:** Some ideas (potholes, transit delays) ranked higher in urgency and feasibility than others (e.g., new playground feature generation).

By the end of Step 2, the group has moved from cool AI “solutions” to a stronger understanding of the actual problems these solutions might tackle. In the next phase of the workshop, they would refine data requirements, discuss potential stakeholders, and map out the feasibility for a pilot project on automated pothole detection and prioritization.

---

### **End of Example Workshop Narrative**