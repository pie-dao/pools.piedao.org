<!--
Provide a general summary of the issue in the title above and use relevant 
fields below to define the problem.
-->

#### User Story
<!--
- Audience or user can include a person or system, i.e. dev, user, api.
- An action or task this issue will accomplish.
- What is the desired outcome or goal?

NOTE: Feel free to replace this with a general description if a user story doesn't make sense, but
be willing to defend your choice to exclude a user story.
-->
- As an <audience/user>: liquidity provider
- I want to <action/task>: see the expected annual mining returns for the token's pool
- so that <outcome/goal/benefit>: I can predict the farming value of providing liquidity

#### Type
<!--
- Select a type of issue
-->
- [X] Enhancement
- [ ] Maintenance
- [ ] Refactor

#### Description
<!--
- Describe the problem and why this task is needed.
-->

Balancer provides $BAL rewards for an liquidity providers (farming). Farming is only possible for tokens which are listed with prices on coingecko, and only when the pool is has public trading enabled. In the event that public trading is disabled, or the pool is composed entirely of tokens without coingecko prices, this section should not be displayed at all. Because we only have Balancer pools at the moment, this section will only apply if the pool is based on Balancer. If it is not, this section will not be displayed.

This section will be directly below the `Your Balance` section in the left hand column. It will have two columns, both with a purple background. The right column's background will be slightly lighter than the left's. In the left column, the Balancer logo (white) will sit to the left, with the phrase `Balancer Labs Liquidity Mining Program` on the right. `Balancer Labs` will be on the first line, and `Liquidity Mining Program` will be on the second. In the left column, 3 lines will display the annual returns. The first line will contain the percentage (ex. 26.5%) in large bold white text. The second line will display the words `Annualized Returns` in extra small text. The third line will display the words `$BAL Tokens` in extra small text.

The expected rewards percentage can be calulated with the following formula:

##### TODO - the formula

#### Definition of Done
<!--
- How do you know when this issue is completed?
- List acceptance criteria, bullet points are always preferred.
-->

- [ ] left column shows the Balancer logo and `Balancer Labs\nLiquidity Mining Program`
- [ ] right column shows expected percentage and `Annualized Returns $BAL Tokens`

#### Attach files or screenshots if it's helpful for this issue.

!(simple page)[https://piedao-productpage-improvements.netlify.app/img/page08.png]