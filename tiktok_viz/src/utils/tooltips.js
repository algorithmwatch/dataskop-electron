import * as d3 from "d3";
import { html } from "htl";

const addTooltips = (chart, hover_styles = { opacity: 0.9 }) => {
  // Add a unique id to the chart for styling
  const id = id_generator();
  // Add the event listeners
  d3.select(chart)
    .attr("id", id)
    .selectAll("title")
    .each(function () {
      // Get the text out of the title, set it as an attribute on the parent, and remove it
      const title = d3.select(this); // title element that we want to remove
      const parent = d3.select(this.parentNode); // visual mark on the screen
      const t = title.text();
      if (t) {
        parent.attr("__title", t).classed("has-title", true);
        title.remove();
      }
      // Mouse events
      parent
        .on("mousemove", function (event) {
          const text = d3.select(this).attr("__title");
          const pointer = d3.pointer(event);
          if (text) hover(pointer, text.split("\n"), chart);
          else d3.selectAll(".dataskop-tooltip").remove();
        })
        .on("mouseout", (event) => {
          d3.selectAll(".dataskop-tooltip").remove();
        });
    });

  // Add styles
  const style_string = Object.keys(hover_styles)
    .map((d) => {
      return `${d}:${hover_styles[d]};`;
    })
    .join("");

  // Define the styles
  const style = html`<style>
      #${id} .has-title {
       cursor: pointer;
       pointer-events: all;
      }
      #${id} .has-title:hover {
        ${style_string}
    }
  </style>`;
  chart.appendChild(style);
  return chart;
};

// Function to position the tooltip
const hover = (pos, text, chart) => {
  if (!d3.select(".dataskop-tooltip").empty()) return;

  const bbox = chart.getBoundingClientRect();

  const left = pos[0] + bbox.x;
  const top = pos[1] + bbox.y;
  d3.select("body")
    .append("div")
    .attr("class", "dataskop-tooltip")
    .text(text)
    .attr("style", `position: absolute; top:${top}px; left: ${left}px;`);
};

// To generate a unique ID for each chart so that they styles only apply to that chart
const id_generator = () => {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return "a" + S4() + S4();
};

export default addTooltips;
