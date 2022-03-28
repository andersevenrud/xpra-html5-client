# Changelog

## 2.2.0 - 2022-03-28

* 86dd183 fix(xpra): prevent recieve queue collisions
* 70ab019 refactor(xpra): minor optimizations
* d4a41c8 refactor(xpra): use eqeqeq
* 3d2f399 refactor(xpra): improved more old audio codec code
* ccf18d6 refactor(xpra): simplify worker registration
* b773b47 refactor(xpra): improved more old imported keyboard code
* 4eb2385 refactor(xpra): improved old imported keyboard code
* 6963d27 fix(xpra): catch exception in decode queue
* 660128a refactor(xpra): some abstraction cleanups
* c98336c feat(xpra): use separate decoder worker
* 0738baa refactor(xpra): remove unused polyfill
* 69b5357 refactor(xpra): place all constant files in a directory
* d5269a2 refactor(xpra): re-arrange queue files
* 3414615 chore(xpra): update jest coverage ignore patterns
* a07e0ed refactor(xpra): add typing for keysym
* f592646 refactor(xpra): split up browser utilities
* eebd1a8 chore(xpra): version bump
* a9537d5 docs(xpra): add coverage badge to README
* b470ec5 ci(xpra): add codecov report
* ce5960e chore(xpra): rename tests directory
* 2bbdff1 refactor(xpra): move rgb image utils
* fd3532e refactor(xpra): minor restructuring
* f2f9929 refactor(xpra): split up worker adapters
* 1a0afd4 refactor(xpra): split up audio adapters
* 560b763 refactor(xpra): rewrite old media portion
* d1a9940 refactor(xpra): rewrite old keyboard portion
* aca372e test(xpra): cover outbound packets and encoders
* cc6f0f4 fix(xpra): wrong image mime type
* 17d3724 refactor(xpra)!: move connection info change to wm
* 7dff0f6 refactor(xpra): minor cleanups
* 6f902d2 test(xpra): add preliminary client processor units
* 935bb82 fix(xpra): correct blob options in send file processor
* 478bba0 refactor(xpra): move open url action to wm
* 263cf0a refactor(xpra): remove setTimeout in queue pushes
* 26029f6 refactor(xpra): add bell event and move sound playback to wm
* 791eea6 test(xpra): add preliminary client units
* a663082 fix(xpra): remove unneeded exception
* 524faba chore(xpra): package.json cleanup
* 20ed847 test(xpra): add connection options units
* c9f5fd3 refactor(xpra): make option url parser accept empty requirements
* aff1397 refactor(xpra): make option url parser accept search query
* cca7c32 chore(xpra): move jest config to package.json
* d06a2f1 test(xpra): add websocket unit
* fbecdd7 ci(xpra): add test environment
* f0905c8 feat(xpra): allow logging packet type by name, not just group
* c7b9ea8 feat(xpra): updated typings
* a485d21 fix(xpra): round mouse button packet position


## 2.1.0 - 2022-03-22

* 2f3c4d3 fix(xpra): clear cached packets on worker connection changes
* 8a66ff3 refactor(xpra): tighten draw queue mutations
* 4286db2 refactor(xpra): minor cleanups
* 5c7292a refactor(xpra): remove raw packet handling quirk
* 7c12c70 chore(xpra): update queue log messages
* 67255b4 feat(xpra): allow literal packet debug types in addition to groups
* ae1c15e feat(xpra): configurable ping timer
* 4592ecf fix(xpra): improved options from url conversion
* cab7dcc feat(xpra): throw error when trying to connect to an already open client
* fd33a2d feat(xpra): allow setting what packets to debug via options
* 9585924 fix(xpra): clear ciphers when switching connections
* b1ffbd5 refactor(xpra): clean up cipher initialization
* 449acc7 fix(xpra): re-initialize ciphers after challenge
* 2d93dd3 refactor(xpra): replace a redundant function
* b058c00 refactor(xpra): don't iife the dpi function
* 6bd3583 fix(xpra): url options parsing broken after refactor
* e136ade refactor(xpra): remove lib index file
* 532aec8 refactor(xpra)!: make default options a function
* aeac949 feat(xpra): configure ciphers when needed
* 925a4b0 feat(xpra): add mpeg1 decoding support
* 864bb26 feat(xpra): add h264 broadway decoding support
* c544508 build(xpra): replace jsmpeg internal module with custom package
* 556f964 refactor(xpra): update av imports
* 4534e26 build(xpra): replace brotli internal module with npm package
* 0aba5e1 build(xpra): replace lz4 internal module with npm package
* 1f8a653 feat(xpra): sort xdg menu entries by name
* 36edebd build(xpra): provide separate av build
* 8e64615 build(xpra): don't clear output directory
* d33ec1c ci(xpra): add analyzer plugin support
* f76e1db feat(xpra): updated types
* 501d3ec build(xpra): improve type generation stage
* 662c450 fix(xpra): function spelling error
* 8199c79 docs(xpra): add basic docblocks to common exports

## 2.0.0 - 2022-03-14

Initial test release.
