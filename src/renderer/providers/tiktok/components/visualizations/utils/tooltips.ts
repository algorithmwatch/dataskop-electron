import * as d3 from "d3";

// To generate a unique ID for each chart so that they styles only apply to that chart
const idGenerator = () => {
  const S4 = () => {
    // eslint-disable-next-line no-bitwise
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `a${S4()}${S4()}`;
};

// Function to position the tooltip
const hover = (pos: [number, number], text: string) => {
  // add offset for tooltip
  const left = pos[0] + 30;
  const top = pos[1];
  const foundTooltip = d3.select(".dataskop-tooltip");

  if (foundTooltip.empty()) {
    // create tooyltip
    d3.select("body")
      .append("div")
      .attr(
        "class",
        "dataskop-tooltip py-2 px-3 rounded shadow bg-white border-2 border-east-blue-200 whitespace-normal",
      )
      .html(text)
      .attr("style", `position: absolute; top:${top}px; left: ${left}px;`);
  } else {
    // update location of tooltip
    foundTooltip.attr(
      "style",
      `position: absolute; top:${top}px; left: ${left}px;`,
    );
  }
};

const addTooltips = (chart: any, onMouseMove = null, onMouseOut = null) => {
  const body = d3.select("body");

  // Add a unique id to the chart for styling
  const id = idGenerator();
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
        parent
          .attr("__title", t)
          .classed("cursor-pointer pointer-events-auto hover:opacity-90", true);
        title.remove();
      }
      // Mouse events
      parent
        .on("mousemove", function (event) {
          const text = d3.select(this).attr("__title");
          console.warn("text", text);
          const pointer = d3.pointer(event, body);
          if (text) hover(pointer, text.split("\n"));
          else d3.selectAll(".dataskop-tooltip").remove();

          if (onMouseMove) {
            onMouseMove(text);
          }
        })
        .on("mouseout", (event) => {
          d3.selectAll(".dataskop-tooltip").remove();
          if (onMouseOut) onMouseOut();
        });
    });

  return chart;
};

export default addTooltips;
