# Dashboard fonts

These unmodified Latin-subset variable WOFF2 files are self-hosted through
`next/font/local` in `../fonts.ts`. The dashboard and its portaled evidence UI
use these variables. The current root layout also exposes them to the shared
application components, following the user's sidebar and shell refactor.
The fonts do not require a browser request to Google Fonts.

Downloaded on 2026-10-21 from the official Google Fonts distribution. Font
metadata was requested with a modern browser user agent using
[the Google Fonts CSS API](https://fonts.googleapis.com/css2?family=Inter:wght@400..600&family=Newsreader:ital,wght@0,400..600;1,400..600&display=swap).
The local declarations use weights 400–600. The Latin subset includes English,
Indonesian, Latin-1 accents, and common punctuation; other characters use the
configured system fallbacks.

| File | Style | Bytes | Official source |
| --- | --- | ---: | --- |
| `inter-latin-variable.woff2` | Normal | 48,256 | [Inter v20](https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2) |
| `newsreader-latin-variable.woff2` | Normal | 58,084 | [Newsreader v26](https://fonts.gstatic.com/s/newsreader/v26/cY9VfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBAbNJYQ.woff2) |
| `newsreader-latin-italic-variable.woff2` | Italic | 64,520 | [Newsreader italic v26](https://fonts.gstatic.com/s/newsreader/v26/cY9XfjOCX1hbuyalUrK439vogqC9yFZCYg7oRZaLFYYzbA.woff2) |

Both font families are licensed under the SIL Open Font License 1.1. The full
copyright notices and licenses are included as `Inter-OFL.txt` and
`Newsreader-OFL.txt`, copied from the official Google Fonts repository:

- [Inter license](https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt)
- [Newsreader license](https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/OFL.txt)

SHA-256 checksums of the distributed font files:

```text
3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62  inter-latin-variable.woff2
62981321d9a3cc7a61a73792729043703fd6112da86e8ec848bb57f088578757  newsreader-latin-variable.woff2
48bc8861b9b2ca9300747cad4fd6a3b4ac3028d364df00bd1b72097baa75e509  newsreader-latin-italic-variable.woff2
```
