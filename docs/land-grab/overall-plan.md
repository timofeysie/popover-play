# Overall Plan for LandGrab

In the LandGrab demo (src/features/landGrab/LandGrabDemo.tsx),
this app is currently trapped in a GitHub pages deployment, so deep linking won’t work.

Further, it is not optimized for mobile use.
We want the user to be able to touch to navigate the landgrab controls and play the game.  

So we need a few things here.

- We need to extract the landGrab demo into its own app.
- We need to think about how it’s going to be deployed.
- We need to make a mobile first layout and functionality so the action is like a good casual gaming experience.
- we need to support multiple languages

I have an app already that has a backend which can be used to support the multiplayer game.
It is deployed via terraform to AWS infrastructure.
This is important because I need to use ‘terraform destroy’ to tear down the infra and save money during the week.
I can then run ‘terraform apply to set everything and run a game once a week.
During this time, I want to support the current player and bots so that a user can practice for the weekend tournament.

My idea is the create an Express React app that can both be deployed from a link, but has the possibility to also be an app that is downloaded from the Android PlayStore and eventually the Apple app store.
I have experience in the past doing this with Ionic apps.

One more thing, we need to support i18n.
Initially we will support to languages, English & Korean.
