<img src="https://www.dropbox.com/scl/fi/ujpbmjaz1ifaz9z7dlr64/logo128x128.png?rlkey=huvscfjwquvubyvur2ieh5kik&raw=1" width="128px" height="128px" />

# Comprehension Lens

80% of engineer time is spent comprehending code, documentation, and business context.

Comprehension Lens is a suite of tools that reduce comprehension time, enhancing developer productivity and satisfaction - all with quantified  ROI for easy business decisions.

There are currently two focus areas: Static Analysis and Backstory

<!-- TOC depthfrom:2 orderedlist:false -->

- [Static Analysis](#static-analysis)
  - [How Does it Differ from Other Static Analysis Tools?](#how-does-it-differ-from-other-static-analysis-tools)
  - [For Engineers](#for-engineers)
  - [For Team Leads](#for-team-leads)
  - [Get Started with the Dashboard](#get-started-with-the-dashboard)
    - [Customize your Context](#customize-your-context)
    - [Directory Metrics](#directory-metrics)
    - [Error Causes Worth Fixing](#error-causes-worth-fixing)
    - [Per-file Metrics](#per-file-metrics)
  - [Get Started Coding](#get-started-coding)
    - [Toggle Preexisting Causes](#toggle-preexisting-causes)
    - [Extensive Help and Examples](#extensive-help-and-examples)
  - [FAQs](#faqs)
- [Backstory](#backstory)

<!-- /TOC -->

## Static Analysis

Static Analysis answers the questions:

- **How much can my team save by preventing code misunderstandings?**
- **Where can we save it?**
- **How much have we saved?**

<img src="https://www.dropbox.com/scl/fi/5rdwio2um0etl17dzgnwl/Screen-Shot-2024-12-05-at-1.31.50-PM.png?rlkey=zjre0j7cg5lvqj1axiq5jq9vl&st=6v0pyof5&raw=1">

<hr/>

### How Does it Differ from Other Static Analysis Tools?

- Identified error causes are backed by world-class research, not opinions
- Causes are quantified in business terms like dollars and ROI
- Causes' values are customized to your business context
- Causes -not- worth fixing are distinct


### For Engineers

John opens his code review feedback. Ugh. Five more comments. One line works differently than he thought. Another line contains incorrect logic. He goes back to fix the problems and await further reviews. The next sprint his reviewer misses a logic error. The code reaches production. Frustrated users complain. John wants to suggest codebase improvements to reduce bugs, but others with more seniority dismiss his opinions.

Comprehension Lens Static Analysis helps you:

- Keep your team happy and spend less time in code reviews with fast-to-understand code
- Learn patterns that quantifiably improve delivery speed and reliability
- Improve code review suggestions with quantified, research-backed insights

### For Team Leads

Team Lead Chris wants to refactor code to prevent bugs in the future. He meets with leadership and product. He knows that preventing the problems is important, but can't quantify the value. The meeting ends with prioritizing new features over preventing bugs. The team feels frustrated, ineffective, and demoralized. They spend extra sprints fixing bugs while unable to improve their situation.

Comprehension Lens Static Analysis helps you:

- Build momentum for refactoring efforts with quick wins and quantified business value
- Improve team delivery speed, reliability, and satisfaction through reduced review time, rework, and bugs
- Communicate efficiently with leadership, product managers, and team members using ROI and other business values




### Get Started with the Dashboard
For a high level view of comprehension issues in your codebase, right click on a file or folder in the explorer. Select "Comprehension Dashboard". The first time you open the dashboard, you'll see a customization wizard that enables you to tailor estimations for your business context (or skip them). Future opens go directly to the dashboard.

#### Customize your Context

Business contexts and codebases differ. Improve your dashboard's accuracy with the customization wizard. Skip it to use reasonable defaults.

<img alt="Customization Wizard" src="https://www.dropbox.com/scl/fi/xvhvrselxv9qmnmgd0bg2/Screen-Cast-2024-12-12-at-2.34.32-PM.gif?rlkey=upibgemizv1x4k9sijk88bv89&&raw=1">

#### Directory Metrics

Rollup metrics for the selected directory are visible at the top of the dashboard. Per-file metrics are available below.

<img alt="Directory Metrics" src="https://www.dropbox.com/scl/fi/bnl4do97ljzkbu0p1jc5a/Screen-Cast-2024-12-03-at-3.35.16-PM.gif?rlkey=7t8i3imms1vcggenat7agtoa9&&raw=1">

#### Error Causes Worth Fixing

Sometimes fixing a problem costs more than it's worth. For example, preventing problems in a file that changes once a year is probably not worth it. Preventing the same problems in a file that changes 20 times a year is.

With comprehension lens, fix only the error causes whose ROI exceeds other business opportunities. Ignore those with negative value.

<img alt="Error Causes with Positive and Negative ROI" src="https://www.dropbox.com/scl/fi/5k3xqnon71kn8zmr7mcpd/Screen-Shot-2024-12-03-at-6.14.32-PM.png?rlkey=osnkvwew1gibdg61ke6dvbjhh&st=hzaaics4&raw=1" />



#### Per-file Metrics

Each file has detailed metrics used in its value calculations, plus additional business values like Payback Period.

<img alt="Per-file Metrics" src="https://www.dropbox.com/scl/fi/normvptz66vhbppp79oo6/Screen-Shot-2024-12-12-at-3.54.45-PM.png?rlkey=lv4i93cu9cvi1a4ezsjsgutoe&st=ty3g5exl&raw=1" />


### Get Started Coding
Once you install Comprehension Lens, nothing happens. This is intentional to minimize interruption.

Upon saving a file, opportunities to prevent error causes appear (i.e., error causes created since the last git commit). Unopened files and files in inactive tabs are not analyzed.


#### Toggle Preexisting Causes
By default, only prevention opportunities appear. Toggle "Fix" mode when you're ready to fix preexisting error causes.

<img alt="Toggle Preexisting Causes" src="https://www.dropbox.com/scl/fi/yk6yphi4n8e0vh6idlsb3/Screen-Cast-2025-01-01-at-1.54.51-PM.gif?rlkey=id5dmhm2n9e3y85lbky25ga1b&raw=1" />


#### Extensive Help and Examples

Error cause documentation includes valid and invalid patterns, examples, and links to underlying research. Complex refactors like negation also include detailed refactoring approaches.

<img alt="Help and Documentation" src="https://www.dropbox.com/s/4msducph3vttnq8/Screen%20Cast%202025-01-01%20at%2011.50.48%20AM.gif?raw=1">

### FAQs

- **Will installing Comprehension Lens interrupt our work?** No. All tools are designed to preserve flow. Nothing happens on installation. Static Analysis defaults to only showing comprehension suggestions on changed code.
- **Can I trust the numbers?** We won't give you numbers we don't trust ourselves. Our core values include precision, accuracy, and learning. Pursuing those, we rigorously evaluate all research - even the replication packages. We exclude research with validity problems or data that are insufficient to quantify changes. Where your context varies from other companies and teams, we enable customization. Finally we learn from the data and customer interactions, updating our model when practice differs from research. We aren't perfect, but we get better every day.
- **What's the cost?** There's a free tier that will always be free. Paid tiers' features and cost are TBD, but we aim to average around 1/10th the value they provide.
- **What if there's a problem?** All errors clearly communicate the problem AND how to resolve it. If problem descriptions or resolutions are ever insufficient, get them fixed and get support via the dashboard's support link.

## Backstory

Backstory answers the question: **Why does this code exist?**

As an engineer, Jane needs to implement a feature. She's confused by the code she needs to change. It doesn't make sense. There's no clear reason for those extra conditions. The names don't help. She's afraid to make changes because she doesn't know what will break. She spends hours digging through tracker tickets, git blame, PR descriptions and comments, documentation, contacting colleagues, and waiting for responses - all to determine the backstory for a section of code.

Comprehension Lens helps you quickly find code backstory for faster onboarding and daily problem solving in unfamiliar code.

It works by combining static analysis, git APIs, issue tracking apis, documentation, and AI summarization.
