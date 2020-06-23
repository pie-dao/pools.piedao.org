## Description
<!--
Brief summary of what this Epic is, whether it's a larger project, goal, 
or user story. Describe the job to be done, which persona this Epic is 
mainly for, or if more multiple, break it down by user and job story.
-->

We will create a liquidity management site for PieDAO liquidity pools.

## Initiative / goal
<!--
Describe what this Epic is attempting to accomplish.
-->

The process of adding liquidity to a pool is painful. We don't providde an interface at all for removing liquidity. The goal of this epic is a first pass at a much less painful version of this process.

## Acceptance criteria and must have scope
<!--
Define what is a must-have for launch and in-scope.
-->

- [ ] Balance of individual tokens is available
- [ ] Pool balance is available
- [ ] If farming rewards are available, they are displayed
- [ ] There are information links (media, audits, etherscan) for each liquidity pool
- [ ] Users can always see the current allocation
- [ ] There is a list of places where the pool can be bought and sold
- [ ] A user can add or remove liquidity from all assets representing the pool
- [ ] A user can add or remove liquidity via a single assets

## Stakeholders
<!--
Describe who needs to be kept up-to-date about this Epic, included 
in discussions, or updated along the way.
-->

Discord #development channel

## Timeline
<!--
What's the timeline for this Epic, what resources are needed, and 
what might potentially block this from hitting the projected end date.
-->

The target timeline for creation of this interface is prior to the release of the single asset entry and exit contracts. Those are currently estimated to be completed by the end of June, at which point an audit will be required for final release. Given a probably 2 week audit cycle, this epic should be production ready by July 15th.

## Visuals

![add-liquidity-single](https://piedao-productpage-improvements.netlify.app/img/page08.png)
![add-liquidity-multi](https://piedao-productpage-improvements.netlify.app/img/page09.png)
![withdraw-liquidity-single](https://piedao-productpage-improvements.netlify.app/img/page10.png)
![withdraw-liquidity-advanced](https://piedao-productpage-improvements.netlify.app/img/page11.png)
![select-a-token](https://piedao-productpage-improvements.netlify.app/img/modal.png)