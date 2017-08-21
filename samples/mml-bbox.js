import {MathJax} from "mathjax3/mathjax.js";
export {MathJax} from "mathjax3/mathjax.js";

import "mathjax3/handlers/html.js";
import {MathML} from "mathjax3/input/mathml.js";
import {CHTML} from "mathjax3/output/chtml.js";

let html = MathJax.document("<html></html>", {
  InputJax: new MathML(),
  OutputJax: new CHTML()
});

MathJax.handleRetriesFor(function () {

    html.TestMath(process.argv[3] || '<math></math>').compile();
    let math = html.math.pop();
    let chtml = html.options.OutputJax;
    console.log(chtml.getBBox(math, html));

}).catch(err => {
  console.log(err.message);
  console.log(err.stack.replace(/\n.*\/system\.js:(.|\n)*/,""));
});
