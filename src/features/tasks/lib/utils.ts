import { JSDOM } from "jsdom";
import { truncateText } from '@/lib/utils';
import { SolutionReturnErrorType } from "../server/task-types";



export function generateTitleAndDescription(content: string) {
  const dom = new JSDOM(content);
  const doc = dom.window.document;

  const titleEl = doc.querySelector("h1, h2, p");
  const anyTetx = doc.querySelector("body");
  console.log(`one lats time text`,anyTetx?.textContent)
  const rawTitle = titleEl?.textContent?.trim() || "";
  const title = truncateText(rawTitle, 80);
  

  let description = "";
  const paragraphs = doc.querySelectorAll("p");
  for (const p of paragraphs) {
    const text = p.textContent?.trim() || "";
    if (text && text !== title) {
      description = truncateText(text, 160);
      break;
    }
  }

  return { title, description };
}