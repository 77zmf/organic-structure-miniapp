# Curiosity Learning Layer Design

## Goal

Turn the current organic structure miniapp from a correct-answer practice tool into a classroom exploration tool. Every page should create a small question in the student's mind, ask for a prediction, then use reaction facts, molecular structure, or AI dialogue to verify the prediction.

The product direction is: **有机结构侦探实验室**.

## Non-Goals

- Do not add rankings, user accounts, medals, long-term progress storage, or a full game economy.
- Do not add large decorative animations that distract from chemistry reasoning.
- Do not expose high-level puzzle answers or pre-filled hints on the advanced page.
- Do not rewrite the chemistry rule engine unless a specific curiosity interaction needs a small data field.

## Design Principles

1. **先猜再证实**: each page should ask students to commit to an idea before revealing the explanation.
2. **现象驱动结构**: feedback should connect visible experimental phenomena to functional groups.
3. **少提示, 多证据**: especially in advanced mode, the UI should record evidence the student obtains rather than provide the path upfront.
4. **课堂可控**: teachers should be able to use each interaction in front of a class without sign-in or setup.
5. **保持高中边界**: explanations stay within common high-school organic chemistry content.

## Global Curiosity Bar

Add a top-level lightweight panel below the mode tabs:

- Label: `今日追问`
- Random question from a small local question bank.
- A `换一个` button for teachers to cycle questions.
- The question should not be a spoiler. It should point attention to a phenomenon or contrast.

Example questions:

- `为什么乙烯能使溴的四氯化碳溶液褪色，而苯通常不能？`
- `同样含氧，为什么有的物质能与钠反应，有的不能？`
- `只知道 C6H6，为什么还不能直接断定它一定是苯？`
- `一个不饱和度为 4 的分子，可能藏着什么结构？`

State:

- Store only the active question index in app state.
- No persistence is required.

## Method Page: Case Route Map

Current role: static textbook flowchart.

New role: `破案路线图`.

Changes:

- Keep the two textbook-derived flows.
- Make each flow node selectable.
- Selected node opens a short explanation panel:
  - what this step tells us
  - what it cannot tell us alone
  - one classroom example
- Default selected node: `计算不饱和度`.

Example node detail:

- Node: `计算不饱和度`
- Explanation: `它能先判断分子里是否可能有环、双键、三键或苯环，但不能直接告诉你是哪一种官能团。下一步必须用实验性质或谱图验证。`

Tests:

- Rendering method mode shows `破案路线图`.
- Clicking a method node changes the detail panel.
- Detail panel includes `能告诉我们` and `还不能确定`.

## Unsaturation Page: Guess Before Formula

Current role: displays formula, unsaturation index, and static explanation.

New role: `分子可能藏了什么结构？`

Changes:

- Add a prediction section before the result.
- Prediction options:
  - `碳碳双键`
  - `碳碳三键`
  - `苯环`
  - `羰基`
  - `环状结构`
  - `都不明显`
- Student can select multiple options.
- Result card still shows formula subscripts and unsaturation index.
- Add feedback comparing prediction to index:
  - `不饱和度为 0`: saturated open-chain candidates are more likely.
  - `不饱和度为 1`: one double bond, carbonyl, or ring is possible.
  - `不饱和度为 2`: triple bond or two unsaturation units are possible.
  - `不饱和度 >= 4`: benzene ring becomes a key possibility, but not the only answer.

Important boundary:

- Do not mark every prediction as strictly right or wrong from the formula alone. Use language like `可能支持`, `仍需实验验证`, and `公式不能单独确认`.

Tests:

- Unsaturation mode renders prediction options.
- Selecting `苯环` for `C6H6` displays feedback containing `可能支持`.
- Formula subscripts still render correctly.

## Reagent Page: Phenomenon Prediction

Current role: choose reagent and judge whether reaction occurs.

New role: predict visible experimental phenomenon before submitting.

Changes:

- Add a `先预测现象` section near the reagent choices.
- Options should be local and reusable:
  - `褪色`
  - `生成沉淀`
  - `放出气体`
  - `出现银镜`
  - `显紫色`
  - `无明显现象`
- Student chooses a phenomenon before or after choosing reaction yes/no.
- Submit feedback should include:
  - correctness of reaction judgment
  - expected phenomenon
  - which functional group explains it
- When feedback is correct or review-worthy, keep the existing 3D functional group highlight active.

Teacher use:

- Random question still works.
- Self-test molecule picker still works.
- Challenge mode should reset the phenomenon prediction at each level.

Tests:

- Reagent mode renders `先预测现象`.
- Submitting ethene + bromine CCl4 with `褪色` shows expected phenomenon feedback.
- Challenge advance clears previous phenomenon selection.

## Pair Page: Reaction Roles

Current role: select two organic molecules, judge if they react, optionally type reaction type.

New role: identify what each molecule contributes to the reaction.

Changes:

- Add a compact `反应角色` section.
- For each side, student can choose one role:
  - `提供羟基`
  - `提供羧基`
  - `提供醛基`
  - `提供酚羟基`
  - `提供苯环`
  - `没有明显配对角色`
- Submit feedback should compare selected roles to the actual functional groups.
- Existing yes/no judgment remains primary.
- Reaction type input remains optional but still evaluated when a reaction exists.

Example:

- Ethanol + acetic acid:
  - Left role: `提供羟基`
  - Right role: `提供羧基`
  - Feedback connects roles to esterification.

Tests:

- Pair mode renders role selectors for both molecules.
- Ethanol + acetic acid role selection feedback contains `羟基` and `羧基`.
- Non-reactive pair can still be judged without forcing a reaction type.

## Advanced Page: Evidence Board

Current role: formula-only puzzle with AI dialogue, no visible hints.

New role: formula-only puzzle plus a blank evidence board that fills only after student action.

Changes:

- Keep no quick questions.
- Keep no opening hint.
- Keep no evidence cards visible on initial render.
- Add an empty `证据板` beside or below the formula panel.
- Evidence board sections:
  - `已验证性质`
  - `排除方向`
  - `当前猜想`
- When the student asks AI a question:
  - add a concise evidence note derived from the AI reply and matched topic.
  - do not reveal target compound name.
- When the student submits a structure guess:
  - if wrong, add to `当前猜想` as an attempted guess.
  - if correct, existing unlock behavior reveals the 3D model.

Data model:

- Add `evidenceNotes` to app state.
- Each note has:
  - `kind`: `verified` | `excluded` | `guess`
  - `text`: string
- Notes are session-local only.

Tests:

- Advanced page initial render has `证据板` but no notes.
- Sending a reagent question adds one `已验证性质` note.
- Wrong structure guess adds a `当前猜想` note.
- Initial advanced page still does not contain quick questions or textbook evidence hints.

## Data and State Changes

Add local state only:

- `curiosityQuestionIndex`
- `selectedMethodNodeId`
- `unsaturationPredictions`
- `reagentPhenomenonGuess`
- `pairRoleGuess`
- `evidenceNotes`

No backend change is required.

No localStorage change is required.

## UI Style

- Keep the current restrained classroom tool style.
- Use 8px radii, existing teal/blue/amber accents, and compact controls.
- Avoid decorative hero sections.
- Prefer buttons, segmented controls, small panels, and evidence lists.
- The UI should feel investigative, not like a marketing landing page.

## Accessibility and Responsiveness

- All new controls are native buttons or selects.
- Selected states must use both visual styling and `aria-pressed` or native select value.
- Mobile layouts stack prediction/role/evidence sections into one column.
- Avoid text overlap by keeping all option labels short and allowing wrapping.

## Verification Plan

Automated:

- Update app rendering tests for all five pages.
- Add unit tests for any new helper that maps reaction results to phenomenon or role feedback.
- Keep existing chemistry rule tests green.

Manual browser checks:

- Desktop:
  - curiosity bar appears
  - method node click updates explanation
  - unsaturation prediction feedback appears
  - reagent phenomenon feedback appears
  - pair role feedback appears
  - advanced evidence board starts empty and fills after student action
- Mobile:
  - no horizontal overflow on method, unsaturation, reagent, pair, or advanced pages
  - evidence board remains readable

Deployment:

- Run `npm test -- --run`.
- Run `npm run build`.
- Verify production bundle contains `今日追问`, `先预测现象`, and `证据板`.

## Implementation Order

1. Add tests for curiosity bar, method node detail, and advanced evidence board.
2. Add shared state and rendering helpers in `src/app.ts`.
3. Implement method page selectable route nodes.
4. Implement unsaturation prediction.
5. Implement reagent phenomenon prediction.
6. Implement pair reaction roles.
7. Implement advanced evidence board.
8. Run full tests, browser checks, commit, push, and deploy.

