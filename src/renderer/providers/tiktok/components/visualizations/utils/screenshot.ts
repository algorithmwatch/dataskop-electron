import { delay } from "renderer/lib/utils/time";
import logo from "renderer/providers/tiktok/static/images/logo.svg";

const doScreenshot = async (box, fn: string) => {
  // Show text for a short time
  const div = document.createElement("div");
  div.style.cssText = `position: absolute; top:${box.height - 40}px; left:${
    box.width - 150
  }px;`;
  div.textContent = "dataskop.net";
  div.id = "dataskop-export-brand-url";
  document.body.insertAdjacentElement("beforeend", div);

  const logoHeight = window.outerHeight * 0.1;

  // Show text for a short time
  const img = document.createElement("img");
  img.style.cssText = `position: absolute; top: 10px; left: 10px; height: ${logoHeight}px;`;
  img.src = logo;
  img.id = "dataskop-export-brand-logo";
  document.body.insertAdjacentElement("beforeend", img);

  const origLogo = document.querySelector("#dataskop-logo");
  if (origLogo) origLogo.style.display = "none";

  // Need some time until the text it rendered
  await delay(100);
  setTimeout(() => {
    document.querySelector("#dataskop-export-brand-url")?.remove();
    document.querySelector("#dataskop-export-brand-logo")?.remove();
    const origLogoHidden = document.querySelector("#dataskop-logo");
    if (origLogoHidden) origLogoHidden.style.display = "";
  }, 500);
  await window.electron.ipc.invoke(
    "export-screenshot",
    {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    },
    fn,
  );
};

export { doScreenshot };
