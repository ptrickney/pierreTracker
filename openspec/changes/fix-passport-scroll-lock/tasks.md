## 1. Modal scroll containment

- [x] 1.1 Add a shared body scroll-lock effect used while Explore Passport or Food Detail is mounted (restore previous overflow on unmount)
- [x] 1.2 Constrain Explore Passport dialog: `overflow-hidden` on panel; `flex-1 min-h-0 overflow-y-auto overscroll-contain` on the content region
- [x] 1.3 Apply the same panel/content scroll constraints to Food Detail

## 2. Verification

- [ ] 2.1 Manually verify: open passport with long content → scroll stays inside overlay; short content → page behind does not scroll; Food Detail same behavior; close restores page scroll
- [ ] 2.2 Run lint and build
