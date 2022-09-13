// import { Radio } from "@material-tailwind/react";

// export default function Colors(props) {
//   return (
//     <div className="flex w-max gap-4">
//       <Radio
//         id="black"
//         name="color"
//         color="black"
//         label={props.label1}
//         defaultChecked
//       />
//       <Radio id="pink" name="color" color="pink-dark" label={props.label2} />
//       <Radio id="aqua" name="color" color="aqua-dark" label={props.label3} />
//     </div>
//   );
// }

import { Radio } from "@material-tailwind/react";

export default function Example(props) {
  return (
    <div className="flex gap-10">
      {/* <Radio id="html" name="type" label="HTML" /> */}
      <Radio
        className="bg-pink-dark"
        id={props.id}
        name="type"
        label={props.label}
        checked={props.checked}
        onChange={props.onChange}
      />
    </div>
  );
}
