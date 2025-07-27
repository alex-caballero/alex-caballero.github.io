// Fallback in case Plot isn't in global scope
window.Plot = window.Plot || observablehq.Plot;
// Text Animation on Load

document.addEventListener("DOMContentLoaded", () => {
  const headline = document.getElementById("headline");
  headline.style.opacity = "0";
  headline.style.transform = "translateY(20px)";
  setTimeout(() => {
    headline.style.transition = "opacity 1.5s, transform 1.5s";
    headline.style.opacity = "1";
    headline.style.transform = "translateY(0)";
  }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
  //BEST Open Rate
  d3.csv("assets/Email_Engagement_Optimizer_Dataset.csv").then((data) => {
    data.forEach((row) => {
      row.send_hour = +row.send_hour;
      row.emails_sent = +row.emails_sent;
      row.opens = +row.opens;
      row.open_rate = row.opens / row.emails_sent;
      row.clicks = +row.clicks;
      row.click_rate = row.clicks / row.emails_sent;
    });
    //segment data by Auidence
    const groupMap = {};
    data.forEach((row) => {
      const key = row.audience_segment;
      if (!groupMap[key]) {
        groupMap[key] = { total: 0, count: 0 };
      }
      groupMap[key].total += row.click_rate;
      groupMap[key].count += 1;
    });
    // GET THE AVG CLICK RATE
    const grouped = Object.entries(groupMap).map(([segment, clickstats]) => {
      return {
        segment: segment,
        avgClik: clickstats.total / clickstats.count,
      };
    });

    grouped.sort((a, b) => b.avgClik - a.avgClik);
    // console.log(grouped);
    //Order Descening
    const yclick = grouped.map((d) => d.segment).reverse();
    const xclick = grouped.map((d) => d.avgClik).reverse();
    const segThree = new Set(yclick.slice(-3));
    console.log(segThree);
    // console.log(yclick, xclick);

    //Observable Plot
    function drawPlot(grouped) {
      const chart = Plot.plot({
        marks: [
          Plot.barX(grouped, {
            x: "avgClik",
            y: "segment",
            fill: (d) => (segThree.has(d.segment) ? "#4CAF50" : "#B0B0B0"),
          }),
          Plot.text(grouped, {
            x: "avgClik",
            y: "segment",
            text: (d) => d3.format(".1%")(d.avgClik),
            dx: -12,
            fill: "black",
          }),
        ],
        x: {
          label: "Click Rate",
          labelAnchor: "center",
          tickFormat: d3.format(".0%"),
        },
        y: {
          domain: yclick,
          label: "Segement",
        },

        marginLeft: 150,
      });

      document.getElementById("barChart").appendChild(chart);
    }
    // ✅ 👇 ADD THIS RIGHT AFTER DEFINING drawPlot
    drawPlot(grouped);

    // Median open rates per hour
    const hourGroups = {};
    data.forEach((row) => {
      if (!hourGroups[row.send_hour]) hourGroups[row.send_hour] = [];
      hourGroups[row.send_hour].push(row.open_rate);
    });
    console.log(hourGroups);

    const medians = Object.fromEntries(
      Object.entries(hourGroups).map(([hour, rates]) => {
        const sorted = rates.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return [
          hour,
          sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2,
        ];
      })
    );
    console.log(medians);

    // Identify top 3 hours
    const top3 = Object.entries(medians)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => +hour);

    // Generate box plots
    const hours = [...new Set(data.map((row) => row.send_hour))].sort(
      (a, b) => a - b
    );

    const boxData = hours.map((hour) => ({
      y: data
        .filter((row) => row.send_hour === hour)
        .map((row) => row.open_rate),
      name: `${hour}:00`,
      type: "box",
      boxpoints: "all",
      jitter: 0.5,
      marker: { color: top3.includes(hour) ? "#4CAF50" : "#B0B0B0" },
      line: { color: top3.includes(hour) ? "#4CAF50" : "#B0B0B0" },
      showlegend: false,
    }));

    Plotly.newPlot("openRateChart", boxData, {
      title: "Open Rate by Send Hour (Top 3 Highlighted)",
      yaxis: {
        title: "Open Rate",
        tickformat: ",.0%",
      },
      xaxis: {
        title: "Hour of Day (24h)",
      },
      showlegend: false,
      margin: { t: 50 },
    });

    // Subject Lines
    // Step 2: Group by subject_line and compute average open rate
    const subjectMap = {};

    data.forEach((row) => {
      const subject = row.subject_line;
      if (!subjectMap[subject]) {
        subjectMap[subject] = { totalRate: 0, count: 0 };
      }
      subjectMap[subject].totalRate += row.open_rate;
      subjectMap[subject].count += 1;
    });

    const subjectAverages = Object.entries(subjectMap).map(
      ([subject, stats]) => {
        return {
          subject: subject,
          avgOpenRate: stats.totalRate / stats.count,
        };
      }
    );
    // Step 3: Sort by avg open rate descending
    subjectAverages.sort((a, b) => b.avgOpenRate - a.avgOpenRate);

    // Step 4: Extract for plotting
    const subjects = subjectAverages.map((d) => d.subject).reverse();
    const avgRates = subjectAverages.map((d) => d.avgOpenRate).reverse();
    console.log(subjectAverages);
    console.log(avgRates);
    const subThree = new Set(subjects.slice(-3));
    console.log(subThree);
    console.log(subjects);
    //plot it witth Comparable Plot

    function drawPlot2(subjectAverages) {
      const subChart = Plot.plot({
        marks: [
          Plot.barX(subjectAverages, {
            x: "avgOpenRate",
            y: "subject",
            fill: (d) => (subThree.has(d.subject) ? "#4CAF50" : "#B0B0B0"),
          }),
          Plot.text(subjectAverages, {
            x: "avgOpenRate",
            y: "subject",
            text: (d) => d3.format(".1%")(d.avgOpenRate),
            dx: -12,
            fill: "black",
          }),
        ],
        x: {
          label: "Open Rate",
          labelAnchor: "center",
          tickFormat: d3.format(".0%"),
        },
        y: {
          domain: subjects,
          label: "Subject",
        },

        marginLeft: 200,
      });

      document.getElementById("subjectChart").appendChild(subChart);
    }
    // ✅ 👇 ADD THIS RIGHT AFTER DEFINING drawPlot
    drawPlot2(subjectAverages);
    // Step 5: Plot it with Plotly
    // Top 3 hours based on median open rates
    const topHours = [7, 10, 16]; // These are the hours with best open rates

    // Transform the data for Plot
    const obsdata = [];

    for (const hour in hourGroups) {
      hourGroups[hour].forEach((value) => {
        obsdata.push({
          hour: parseInt(hour),
          value: value,
          isTopHour: topHours.includes(parseInt(hour)),
        });
      });
    }
    console.log(obsdata);

    Plotly.newPlot(
      "subjectLineChart",
      [
        {
          type: "bar",
          x: avgRates,
          y: subjects,
          orientation: "h",
          marker: { color: "#4B8BBE" },
          text: avgRates.map((rate) => `${(rate * 100).toFixed(2)}%`),
          textposition: "auto",
        },
      ],
      {
        title: "Average Open Rate by Subject Line",
        xaxis: {
          title: "Open Rate",
          tickformat: ",.0%",
          range: [0.2, 0.3], // depends on your data
        },
        yaxis: {
          automargin: true,
        },
        margin: { l: 200 },
      }
    );
    //Audience Segment Chart

    //plot the chart
    Plotly.newPlot(
      "segmentChart",
      [
        {
          type: "bar",
          x: xclick,
          y: yclick,
          orientation: "h",
          text: xclick.map((rate) => `${(rate * 100).toFixed(1)}%`),
          textposition: "auto",
          marker: {
            color: xclick.map((val, i) =>
              i >= xclick.length - 3 ? "#4CAF50" : "#B0B0B0"
            ),
          },
        },
      ],
      {
        title: "Click Rate by Segement",
        xaxis: { title: "Click Rate", tickformat: ",.0%" },
        yaxis: {
          automargin: true,
        },
        margin: { l: 200 },
        showlegend: false,
      }
    );
  });
});
console.log("Is Plot available?", typeof Plot);
