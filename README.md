# Hotel Aurelian: The Night Shift (v2, arcade edition)

A browser game from Tammy Michelli's novel *The Mirror That Ate the Hotel*. You are Agnes Szabo, night auditor of the 1904 Hotel Aurelian on Lake Superior. The lobby mirror belches at 2:51, give or take a minute, and tonight it is eating rooms. Explore the hotel, play fast action games at the big story moments, and keep every room in the ledger, in ink.

Night One is free. Paperback and hardcover readers unlock Nights Two and Three with a word from their copy. Works on phones and computers, saves your progress on your device, and plays offline after the first visit.

Play: https://smiles2322-cmd.github.io/mirror-hotel/
Get the book: https://a.co/d/0atLWG3R

## New in v2

- Ten action games with score, combos, three lamps (lives), stars, best scores, confetti, and a jaunty lounge soundtrack:
  - Night One: Balance the Books (the audit report), Leftover Catch (the 2:51 belch), Tongue Crossing (back to the desk).
  - Night Two: The Other Line (ink or pencil, against the clock), Switchboard Scramble (after extension zero), Cough Catch (Room 309).
  - Night Three: The Dark Hallway (the basement), Grab Dodge (the 2:51 belch), Jar Rush (the Jar Room).
  - Every night: Pull It Back! When the mirror tries to eat a room that is not in ink, win the tug of war to save it.
- A shift score in the top bar, and a night audit that rates the action games.
- The Trophy Room: a Jar Shelf of 18 leftovers to collect (glowing gold ones in the games), artifacts you notice around the hotel, 17 achievements, and an arcade to replay any game you have reached.
- Skip button on long story scenes. Story mode in Settings skips the action games for readers who only want the story.
- Every game works with touch, mouse, or keyboard, and pauses itself if you switch away.

## Files

- `index.html` and the folders beside it are the whole game. Put them on any static web host.
- `tests/test-game-v2.js` plays all three nights through with Playwright (it needs the private answer file, which is not included).
- `screenshots/` shows the game on a phone (390x844) and a computer (1280x800).

The site is published from `site.tgz.b64` (split into numbered parts when large) by the Publish site workflow.
