# Qizhi Lu — personal website

A responsive academic portfolio built with HTML, CSS, and a small email-reveal
script. No build step or package installation is required. GitHub Pages can
serve the files directly from the repository root.

## Editing

- `index.html`: introduction, publications, education, and contact controls.
- `style.css`: colors, typography, layout, and responsive behavior.
- `contact.js`: email addresses decoded only after deliberate user interaction.
- `images/`: the original research figures and the airfoil illustration.
- `scripts/generate-airfoil.mjs`: regenerates the idealized airfoil flow SVG with
  Node.js and checks that neighboring streamline polylines do not intersect.

Publication summaries are followed by expandable descriptions retained from the
previous site. All sections have stable anchors for sharing, such as `#research`.
Keep official publication titles and links aligned with the published papers.

The previous photography entries referenced files that were never included in
the repository. The Ephemerals section currently displays “To be updated.” Add a gallery when actual photographs are
available, with descriptive alternative text. A portrait and CV can also be
added when available; the current site does not link to nonexistent files.

## Local preview

Serve this directory with any static HTTP server, or open `index.html` directly
in a browser. Check both narrow and wide screens after layout changes.

## Publishing

Push the reviewed commit to the branch selected in the repository's GitHub
Pages settings. This redesign preserves the existing `personal_website` URL
and uses relative paths for all local assets.

## Contact privacy

Full email addresses and email links are absent from the initial page markup.
The reveal controls reconstruct them only after a click or keyboard activation.
This reduces routine harvesting and keeps them out of the initial page text,
but cannot guarantee protection from a crawler that executes and interacts with
JavaScript or decodes the script. Do not treat obfuscation as access control.

## Airfoil illustration

The SVG depicts steady, incompressible potential flow around a symmetric
Joukowski airfoil at six-degree incidence, with circulation set by the
trailing-edge Kutta condition. The complete solution is rotated to keep the
freestream horizontal. Its streamlines are mapped
from constant stream-function contours outside the generating circle. This is
an idealized diagram, not a viscous CFD result. It follows the mapping described
by [NASA Glenn](https://www.grc.nasa.gov/WWW/K-12/airplane/map.html).

Regenerate the static asset with `node scripts/generate-airfoil.mjs`; visitors
do not run the generator.
