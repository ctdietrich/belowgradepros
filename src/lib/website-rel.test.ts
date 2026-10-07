import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { websiteLinkRel } from "./website-rel";

const CHAMPION = "champion-waterproofing-foundation-repair-lexington-ky";

function websiteAnchor(slug: string) {
  return renderToStaticMarkup(
    createElement(
      "a",
      {
        href: "https://contractor.example",
        target: "_blank",
        rel: websiteLinkRel(slug),
      },
      "contractor.example",
    ),
  );
}

test("websiteLinkRel nofollows only flagged contractor slugs", () => {
  assert.equal(websiteLinkRel(CHAMPION), "nofollow noopener noreferrer");
  assert.equal(websiteLinkRel("bayou-grade-waterproofing"), "noreferrer");
  assert.equal(websiteLinkRel(""), "noreferrer");
  assert.equal(websiteLinkRel(`${CHAMPION}-extra`), "noreferrer");

  assert.equal(
    websiteAnchor(CHAMPION),
    '<a href="https://contractor.example" target="_blank" rel="nofollow noopener noreferrer">contractor.example</a>',
  );
  assert.equal(
    websiteAnchor("bayou-grade-waterproofing"),
    '<a href="https://contractor.example" target="_blank" rel="noreferrer">contractor.example</a>',
  );
});
