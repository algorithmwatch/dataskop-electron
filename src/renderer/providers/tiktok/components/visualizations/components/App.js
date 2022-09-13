import "../App.css";
import { useState } from "react";
import VizOne from "./VizOne";
import VizTwo from "./VizTwo";
import VizOneDropDown from "./VizOneDropDown";
import { breakFrequency, twoOrLessVids } from "../utils/viz_one_utilities";
import { shortenGdprData, shortenMetadata } from "../utils/shorten_data";

function App() {
  const selectVizOptions = [
    { option: "Viz 1" },
    { option: "Viz 2" },
    { option: "Viz 3" },
  ];

  // const selectDataOptions = [
  //   { option: "biggest" },
  //   { option: "data000" },
  //   { option: "med" },
  //   { option: "small" },
  // ];

  const [viz, setViz] = useState(selectVizOptions[0]);
  // const [data, setData] = useState(selectDataOptions[0]);
  let [
    videodata,
    logindata,
    loginObj,
    tiktokLiveVids,
    likedVids,
    sharedVids,
    savedVids,
  ] = shortenGdprData(biggestData);

  console.log("login data", loginObj);

  // set to new variable or reassign?
  let shortenedSmallMetadata = shortenMetadata(peterScrapedData);

  return (
    <div className="visualizations">
      <header className="selectVizAndData flex">
        <div>Select a Visualization </div>
        <VizOneDropDown
          options={selectVizOptions}
          onChange={(e) => {
            setViz(e);
          }}
          selected={viz}
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
      <VizOne
        vidData={videodata}
        loginData={logindata}
        loginObj={loginObj}
        liveData={tiktokLiveVids}
      />
      {/* <VizTwo metadata={shortenedSmallMetadata} gdprData={videodata} /> */}
      {/* <VizThree metadata={peterScrapedData} likedVids={likedVids} sharedVids={sharedVids} savedVids={savedVids} */}{" "}
      {/* */}
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