import "../App.css";
import VizOne from "./VizOne";
import VizOneDropDown from "./VizOneDropDown";
import { breakFrequency, twoOrLessVids } from "../utils/viz_utilities";

function App() {
  // const selectVizOptions = [
  //   { option: "Viz 1" },
  //   { option: "Viz 2" },
  //   { option: "Viz 3" },
  // ];

  // const selectDataOptions = [
  //   { option: "biggest" },
  //   { option: "data000" },
  //   { option: "med" },
  //   { option: "small" },
  // ];

  // const [viz, setViz] = useState(selectVizOptions[0]);
  // const [data, setData] = useState(selectDataOptions[0]);

  return (
    <div className="visualizations">
      <header>
        Select a Visualization{" "}
        <VizOneDropDown
        // selected={viz}
        // options={selectVizOptions}
        // onChange={(e) => {
        //   setViz(e);
        // }}
        />
      </header>

      <h2>
        Select data{" "}
        <VizOneDropDown
        // selected={data}
        // options={selectDataOptions}
        // onChange={(e) => {
        //   setData(e);
        // }}
        />
      </h2>
      <VizOne />
    </div>
  );
}

export default App;
// function App() {
//   // let videoData = data000.Activity["Video Browsing History"].VideoList.map(
//   //   (videos) => ({
//   //     Date: new Date(videos.Date),
//   //   })
//   // );
//   // console.log(videoData[0].Date.getHours());
//   // console.log(
//   //   typeof data000.Activity["Share History"].ShareHistoryList[0].Date
//   // );
//   // const peter_data = data000.Activity["Video Browsing History"].VideoList;
//   // const biggest = biggestData.Activity["Video Browsing History"].VideoList;
//   let [average, averagePerDay, percent2, percent5, percent10] =
//     breakFrequency();

//   let percent2OrLessVids = twoOrLessVids();
//   console.log(average);

//   // const
//   return (
//     <div className="App">
//       {/* <header className="App-header"></header> */}
//       <body>
//         <div>
//           <h2>Data About Gaps (Between Videos) </h2>
//           <ul>
//             <li>
//               The average time of gaps is <b>{average}</b> minutes
//             </li>
//             <li>
//               The average time of gaps per day is <b>{averagePerDay}</b> minutes
//             </li>
//             <li>
//               Percentage of gaps over 6 seconds: <b>{percent2}%</b>
//             </li>
//             <li>
//               Percentage of gaps over 5 minutes: <b>{percent5}%</b>
//             </li>
//             <li>
//               Percentage of gaps over 10 minutes: <b>{percent10}%</b>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <h2>Data About 2 or less Videos Per Day</h2>
//           <ul>
//             <li>
//               The percent of days where 2 or less videos were watched is:{" "}
//               <b>{percent2OrLessVids}%</b>
//             </li>
//           </ul>
//         </div>

//         <div>
//           <VizOne />
//         </div>
//       </body>
//     </div>
//   );
// }
// export default App;
