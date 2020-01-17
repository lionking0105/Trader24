import React from "react";
import firebase from "firebase/app";
import {Line} from "react-chartjs-2";
import {defaults} from "react-chartjs-2";
import {Link} from "react-router-dom";
import "chartjs-plugin-annotation";
import $ from "jquery";

import News from "./News.js";
import Leftbar from "../Elements/leftbar";
import Topbar from "../Elements/topbar";

defaults.global.defaultFontStyle = "Bold";
defaults.global.defaultFontFamily = "Quantico";
defaults.global.animation.duration = 200;

const db = firebase.firestore();
var options = {
  layout: {
    padding: {
      right: 25,
      left: 25,
    },
  },
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label(tooltipItems, data) {
        return `$${tooltipItems.yLabel}`;
      },
    },
    displayColors: false,
  },
  hover: {
    mode: "index",
    intersect: false,
  },
  maintainAspectRatio: false,
  responsive: true,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      },
    ],
    fontStyle: "bold",
    yAxes: [
      {
        gridLines: {
          color: "rgba(0, 0, 0, 0)",
        },
        fontStyle: "bold",

        ticks: {
          callback(value) {
            return "$" + value.toFixed(2);
          },
        },
      },
    ],
  },
  elements: {
    point: {
      radius: 0,
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round",
    },
  },
};

const apiKeys = [
  "SAOS0Y8B63XM4DPK",
  "4LPH6E70R1XQR2L5",
  "NOBPQ2OPX7E1XRT3",
  "7V0Q0N46CBIPHA2K",
];

let symbol;

// CHARTS

let chartData1 = [];
let labels = [];
let symbolsOnly = [];
let closePrice;
let stockData = {};
let keyData = [];
let keyDataLabel = [];
let allSymbols = [];

let twoYears = [];
let twoYearsLabels = [];

let oneYear = [];
let oneYearLabels = [];

let ytdChart = [];
let ytdLabels = [];

let oneMonth = [];
let oneMonthLabels = [];

let oneDay = [];
let oneDayLabels = [];

export default class stockPage extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      loaded: "",
      fundsWithoutCommas: "",
      accountValue: "",
      changeColor: "",
      extendedColor: "",
      marketStatus: "",
      valid: "",
      latestPrice: "",
      buyConfirmation: "",
    };
    this.data1 = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      return {
        labels,
        datasets: [
          {
            lineTension: 0.1,
            label: "",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            pointBackgroundColor: gradient,
            fill: true,
            borderWidth: 2,
            data: chartData1,
          },
        ],
      };
    };
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /*
   * searches stocks
   * @param {e} value to search for
   */

  searchStocks(e) {
    document.getElementById("results").innerHTML = "";
    let b = 0;
    let filter = document.getElementById("searchBar").value.toUpperCase();
    if (e.key === "Enter") {
      window.location = `/stocks/${filter}`;
    }
    if (filter.length === 0) {
      document.getElementById("results").innerHTML = "";
      document.getElementById("results").style.display = "none";
    } else {
      for (let i = 0; i < allSymbols.length; i++) {
        let splitSymbol = allSymbols[parseInt(i)].symbol.split("");
        let splitFilter = filter.split("");
        for (let a = 0; a < splitFilter.length; a++) {
          if (
            allSymbols[parseInt(i)].symbol.indexOf(filter) > -1 &&
            splitSymbol[parseInt(a)] === splitFilter[parseInt(a)]
          ) {
            if (a === 0) {
              document.getElementById("results").style.display = "flex";
              $("#results").append(
                `<li><a href="/stocks/${allSymbols[parseInt(i)].symbol}"><h4>${
                  allSymbols[parseInt(i)].symbol
                }</h4><h6>${allSymbols[parseInt(i)].name}</h6></a></li>`,
              );
              b++;
            }
          }
        }
        if (b === 10) {
          break;
        }
      }
    }
  }

  getOneDayChart() {
    const anno = {
      annotations: [
        {
          borderDash: [2, 2],
          drawTime: "afterDatasetsDraw",
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: closePrice,
          borderColor: "#676976",
          borderWidth: 1,
        },
      ],
    };
    labels = [];
    chartData1 = [];
    let b = 0;
    if (oneDay.length === 0) {
      const stockApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${apiKeys[0]}`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          if (typeof result["Note"] === "undefined") {
            for (
              let i = Object.keys(result["Time Series (1min)"]).length - 1;
              i > 0;
              i--
            ) {
              chartData1.push(
                parseFloat(
                  result["Time Series (1min)"][
                    Object.keys(result["Time Series (1min)"])[parseInt(i)]
                  ]["4. close"],
                ).toFixed(2),
              );
              labels.push(
                Object.keys(result["Time Series (1min)"])
                  [parseInt(i)].split(" ")[1]
                  .slice(0, -3),
              );
            }
          } else {
            setTimeout(() => {
              b++;
              const stockApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${
                apiKeys[parseInt(b)]
              }`;
              fetch(stockApi)
                .then(res => res.json())
                .then(result => {
                  for (
                    let i =
                      Object.keys(result["Time Series (1min)"]).length - 1;
                    i > 0;
                    i--
                  ) {
                    chartData1.push(
                      parseFloat(
                        result["Time Series (1min)"][
                          Object.keys(result["Time Series (1min)"])[parseInt(i)]
                        ]["4. close"],
                      ).toFixed(2),
                    );
                    labels.push(
                      Object.keys(result["Time Series (1min)"])
                        [parseInt(i)].split(" ")[1]
                        .slice(0, -3),
                    );
                  }
                });
            }, 500);
          }
        })
        .then(() => {
          setTimeout(() => {
            if (this._isMounted) {
              this.setState({
                loaded: true,
              });
              chartData1.map(val => oneDay.push(val));
              labels.map(val => oneDayLabels.push(val));
            }
          }, 1000);
        });
    } else {
      labels = oneDayLabels;
      chartData1 = oneDay;
      if (this._isMounted) {
        this.setState({
          loaded: true,
        });
      }
    }
    options.annotation = anno;
  }

  getYTDChart() {
    labels = [];
    chartData1 = [];
    if (ytdChart.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${symbol}/batch?token=${process.env.REACT_APP_API_KEY_2}&types=chart,quote&range=ytd`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[parseInt(i)].average !== null) {
              chartData1.push(result.chart[parseInt(i)].close.toFixed(2));
              labels.push(result.chart[parseInt(i)].label);
            }
          }
        })
        .then(() => {
          if (this._isMounted) {
            this.setState({
              loaded: true,
            });

            chartData1.map(val => ytdChart.push(val));
            labels.map(val => ytdLabels.push(val));
          }
        });
    } else {
      labels = ytdLabels;
      chartData1 = ytdChart;
      if (this._isMounted) {
        this.setState({
          loaded: true,
        });
      }
    }

    options.annotation = "";
  }

  getOneYearChart() {
    labels = [];
    chartData1 = [];
    if (oneYear.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${symbol}/batch?token=${process.env.REACT_APP_API_KEY_2}&types=chart,quote&range=1y`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[parseInt(i)].average !== null) {
              chartData1.push(result.chart[parseInt(i)].close.toFixed(2));
              labels.push(result.chart[parseInt(i)].label);
            }
          }
        })
        .then(() => {
          if (this._isMounted) {
            this.setState({
              loaded: true,
            });
          }
          chartData1.map(val => oneYear.push(val));
          labels.map(val => oneYearLabels.push(val));
        });
    } else {
      labels = oneYearLabels;
      chartData1 = oneYear;
      if (this._isMounted) {
        this.setState({
          loaded: true,
        });
      }
    }
    options.annotation = "";
  }

  getTwoYearChart() {
    labels = [];
    chartData1 = [];
    if (twoYears.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${symbol}/batch?token=${process.env.REACT_APP_API_KEY_2}&types=chart,quote&range=2y`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[parseInt(i)].average !== null) {
              chartData1.push(result.chart[parseInt(i)].close.toFixed(2));
              labels.push(result.chart[parseInt(i)].label);
            }
          }
        })
        .then(() => {
          if (this._isMounted) {
            this.setState({
              loaded: true,
            });
          }
          chartData1.map(val => twoYears.push(val));
          labels.map(val => twoYearsLabels.push(val));
        });
    } else {
      labels = twoYearsLabels;
      chartData1 = twoYears;
      if (this._isMounted) {
        this.setState({
          loaded: true,
        });
      }
    }
    options.annotation = "";
  }

  getOneMonthChart() {
    labels = [];
    chartData1 = [];
    if (oneMonth.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${symbol}/batch?token=${process.env.REACT_APP_API_KEY_2}&types=chart,quote&range=1m`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[parseInt(i)].average !== null) {
              chartData1.push(result.chart[parseInt(i)].close.toFixed(2));
              labels.push(result.chart[parseInt(i)].label);
            }
          }
        })
        .then(() => {
          if (this._isMounted) {
            this.setState({
              loaded: true,
            });
          }
          chartData1.map(val => oneMonth.push(val));
          labels.map(val => oneMonthLabels.push(val));
        });
    } else {
      labels = oneMonthLabels;
      chartData1 = oneMonth;
      if (this._isMounted) {
        this.setState({
          loaded: true,
        });
      }
    }
    options.annotation = "";
  }
  /*
   * converts number to short version of milions, bilions etc.
   * @param {number} number to convert
   * @param {decPlaces} how many decimal places
   */
  abbrNum(number, decPlaces) {
    decPlaces = Math.pow(10, decPlaces);
    var abbrev = ["k", "m", "b", "t"];
    for (var i = abbrev.length - 1; i >= 0; i--) {
      var size = Math.pow(10, (i + 1) * 3);
      if (size <= number) {
        number = Math.round((number * decPlaces) / size) / decPlaces;
        if (number === 1000 && i < abbrev.length - 1) {
          number = 1;
          i++;
        }
        number += abbrev[parseInt(i)];
        break;
      }
    }

    return number;
  }
  /*
   * check i value is in array
   * @param {arr} array
   * @param {val} value
   */
  isInArray(arr, val) {
    return arr.indexOf(val) > -1;
  }

  /*
   * changes look of buttons above chart
   * @param {option} selected option
   */

  changeFocus(option) {
    setTimeout(function() {
      var elems = document.querySelectorAll(".stockPage__option");

      [].forEach.call(elems, function(el) {
        el.classList.remove("active");
      });
      switch (option) {
        case 1:
          document.getElementById("1d").classList.add("active");
          break;

        case 2:
          document.getElementById("1m").classList.add("active");
          break;

        case 3:
          document.getElementById("1y").classList.add("active");
          break;

        case 4:
          document.getElementById("2y").classList.add("active");
          break;

        case 5:
          document.getElementById("ytd").classList.add("active");
          break;
        default:
          document.getElementById("ytd").classList.add("active");
          break;
      }
    }, 200);
  }

  rendering() {
    fetch(
      `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=${process.env.REACT_APP_API_KEY_2}`,
    )
      .then(res => res.json())
      .then(result => {
        stockData.changePercent = result.changePercent.toFixed(2);
        stockData.change = result.change.toFixed(2);

        closePrice = result.previousClose;

        stockData.name = result.companyName;
        stockData.previousClose = result.previousClose;
        stockData.latestTime = result.latestTime;
        stockData.extendedPrice = result.extendedPrice;
        if (result.extendedPrice === null) {
          stockData.extendedPrice = "";
          stockData.extendedChange = "";
        }
        stockData.extendedChange = result.extendedChange;
        if (this._isMounted) {
          this.setState({
            latestPrice: result.latestPrice.toFixed(2),
          });
        }
        keyData[0] = this.abbrNum(result.marketCap, 2);
        keyDataLabel[0] = "Market Cap ";
        keyData[1] = result.peRatio;
        keyDataLabel[1] = "PE Ratio (TTM) ";

        keyData[2] = "$" + result.week52High;
        keyDataLabel[2] = "52 week High";

        keyData[3] = "$" + result.week52Low;
        keyDataLabel[3] = "52 Week Low ";

        keyData[4] = result.ytdChange.toFixed(2) + "%";
        keyDataLabel[4] = "YTD Change ";

        keyData[5] = result.latestVolume;
        if (keyData[5] !== null) {
          keyData[5] = this.numberWithCommas(keyData[5]);
        } else {
          keyData[5] = "---";
        }
        keyDataLabel[5] = "Volume ";
      })
      .then(
        function() {
          if (stockData.change > 0 && this._isMounted) {
            this.setState({
              changeColor: "#3ae885",
            });
          } else if (this._isMounted) {
            this.setState({
              changeColor: "#F45385",
            });
          }
          if (stockData.extendedChange > 0 && this._isMounted) {
            this.setState({
              extendedColor: "#66F9DA",
            });
          } else if (this._isMounted) {
            this.setState({
              extendedColor: "#F45385",
            });
          }
        }.bind(this),
      );
    document.title = `Trader24 - ${symbol}`;
    fetch(
      `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=${process.env.REACT_APP_API_KEY_2}`,
    )
      .then(res => res.json())
      .then(result => {
        if (this._isMounted) {
          this.setState({
            latestPrice: result.latestPrice.toFixed(2),
          });
        }
      })
      .then(() => {
        if (this.state.marketStatus) {
          setInterval(() => {
            fetch(
              `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=${process.env.REACT_APP_API_KEY_2}`,
            )
              .then(res => res.json())
              .then(result => {
                if (this._isMounted) {
                  this.setState({
                    latestPrice: result.latestPrice.toFixed(2),
                  });
                }
              });
          }, 5000);
        }
      });
    setTimeout(() => {
      if (!this.state.marketStatus && $("#buy-input").length) {
        document.getElementById("buy-input").disabled = true;
        document.getElementById("buy-input").placeholder = "MARKET CLOSED";
      } else if ($("#buy-input").length) {
        document.getElementById("buy-input").disabled = false;
        document.getElementById("buy-input").placeholder = "QUANTITY";
      }
    }, 1000);

    this.getYTDChart();
    if (document.querySelector(".hamburger")) {
      document.querySelector(".hamburger").addEventListener("click", e => {
        e.currentTarget.classList.toggle("is-active");
      });
    }
  }
  handleBuyStock(num) {
    let user = firebase.auth().currentUser.uid;
    let positionsNumber;

    db.collection("users")
      .doc(user)
      .get()
      .then(doc => {
        positionsNumber = doc.data()["positions"];
      })
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(user)
          .collection("stocks")
          .doc("Position" + positionsNumber)
          .set({
            symbol,
            moneyPaid: (Number(num) * Number(this.state.latestPrice)).toFixed(
              2,
            ),
            shares: num,
            value: (Number(num) * Number(this.state.latestPrice)).toFixed(2),
          })
          .catch(error => {
            console.log("Error getting document:", error);
          });
      })
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(user)
          .update({
            currentfunds: (
              Number(this.state.fundsWithoutCommas) -
              Number(num) * Number(this.state.latestPrice)
            ).toFixed(2),
            positions: Number(positionsNumber) + 1,
          })
          .catch(error => {
            console.log("Error getting document:", error);
          });
      })
      .then(() => {
        this.getFunds();
        if (this._isMounted) {
          this.setState({
            buyConfirmation: false,
          });
        }
      });
  }
  getFunds() {
    if (this._isMounted) {
      this.setState({
        fundsWithoutCommas: "",
      });
    }
    let user = firebase.auth().currentUser.uid;
    let docRef = db.collection("users").doc(user);

    docRef
      .get()
      .then(doc => {
        if (this._isMounted) {
          this.setState({
            funds: "$" + this.numberWithCommas(doc.data()["currentfunds"]),
          });
          this.setState({
            fundsWithoutCommas: doc.data()["currentfunds"],
          });
        }
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
  }

  componentDidMount() {
    this._isMounted = true;
    fetch("https://financialmodelingprep.com/api/v3/is-the-market-open")
      .then(res => res.json())
      .then(result => {
        if (this._isMounted) {
          this.setState({
            marketStatus: result.isTheStockMarketOpen,
          });
        }
      });
    fetch(
      `https://cloud.iexapis.com/stable/ref-data/symbols?token=${process.env.REACT_APP_API_KEY_2}`,
    )
      .then(res => res.json())
      .then(result => {
        allSymbols = result.map(val => {
          return val;
        });
        for (let i = 0; i < result.length; i++) {
          symbolsOnly.push(result[parseInt(i)].symbol);
        }
      })
      .then(() => {
        symbol = window.location.href.split("/")[
          window.location.href.split("/").length - 1
        ];
        setTimeout(() => {
          if (this.isInArray(symbolsOnly, symbol)) {
            if (this._isMounted) {
              this.setState({valid: true});
            }
            this.rendering();
          } else if (this._isMounted) {
            this.setState({valid: false});
          }
        }, 1000);
      });
    this.getFunds();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <section className="stock">
        {this.state.buyConfirmation === true && <div className="black-bg" />}
        {this.state.buyConfirmation === true && (
          <div className="buyConfirmation">
            <h3>
              Are you sure you want to buy{" "}
              {document.getElementById("buy-input").value} shares of {symbol}{" "}
              for{" "}
              <span style={{fontWeight: "bold"}}>
                {parseFloat(
                  (
                    document.getElementById("buy-input").value *
                    this.state.latestPrice
                  ).toFixed(2),
                )}
              </span>{" "}
              dollars
            </h3>
            <div>
              <button
                className="stockPage__buy-button"
                onClick={() => {
                  if (
                    document.getElementById("buy-input").value *
                      this.state.latestPrice <=
                    this.state.fundsWithoutCommas
                  ) {
                    this.handleBuyStock(
                      document.getElementById("buy-input").value,
                    );
                  } else if (this._isMounted) {
                    this.setState({
                      buyConfirmation: false,
                    });
                  }
                }}>
                CONFIRM
              </button>
              <button
                className="stockPage__buy-button cancel"
                onClick={() => {
                  if (this._isMounted) {
                    this.setState({
                      buyConfirmation: false,
                    });
                  }
                }}>
                CANCEL
              </button>
            </div>
          </div>
        )}
        {this.state.valid === "" && (
          <ul className="loader">
            <li />
            <li />
            <li />
          </ul>
        )}
        {this.state.valid && (
          <div style={{display: "flex", height: "100%"}}>
            <Leftbar />
            <div className="stockPage">
              <Topbar />
              {this.state.loaded ? (
                <div className="stockPage__top">
                  <div className="stockPage__chart">
                    <div className="stock__info">{stockData.companyName}</div>
                    <Line data={this.data1} options={options} />
                    <div className="stockPage__timers">
                      <h6
                        className="stockPage__option"
                        id="2y"
                        onClick={() => {
                          this.getTwoYearChart();
                          this.changeFocus(4);
                        }}>
                        2Y
                      </h6>
                      <h6
                        className="stockPage__option"
                        id="1y"
                        onClick={() => {
                          this.getOneYearChart();
                          this.changeFocus(3);
                        }}>
                        1Y
                      </h6>

                      <h6
                        className="active stockPage__option"
                        id="ytd"
                        onClick={() => {
                          this.classList = "active";
                          this.changeFocus(5);
                          this.getYTDChart();
                        }}>
                        YTD
                      </h6>
                      <h6
                        className="stockPage__option"
                        id="1m"
                        onClick={function() {
                          this.changeFocus(2);
                          this.getOneMonthChart();
                        }.bind(this)}>
                        1M
                      </h6>
                      <h6
                        className="stockPage__option"
                        id="1d"
                        onClick={() => {
                          this.changeFocus(1);
                          this.getOneDayChart();
                        }}>
                        1D
                      </h6>
                    </div>
                  </div>
                  <div className="stockPage__trade">
                    <div className="stockPage__mobile">
                      <h4>{stockData.name}</h4>
                      <div className="stockPage__trade-top">
                        <h2>${this.state.latestPrice}</h2>
                        <h6 style={{color: this.state.changeColor}}>
                          {stockData.change} ({stockData.changePercent}%)
                        </h6>
                      </div>
                    </div>
                    {!this.state.marketStatus &
                    (stockData.extendedChange !== null) ? (
                      <h6>
                        Extended Hours:{" "}
                        <span style={{color: this.state.extendedColor}}>
                          ${stockData.extendedPrice} ({stockData.extendedChange}
                          )
                        </span>
                      </h6>
                    ) : (
                      <div />
                    )}
                    <h5>Buy {symbol}</h5>
                    <div className="stockPage__buy-container">
                      <input
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className="stockPage__buy-input"
                        id="buy-input"
                        type="number"
                        disabled
                      />

                      <button
                        onClick={function() {
                          let value = document.getElementById("buy-input")
                            .value;
                          if (
                            value.length > 0 &&
                            value > 0 &&
                            value * this.state.latestPrice <=
                              this.state.fundsWithoutCommas &&
                            this.state.marketStatus &&
                            this._isMounted
                          ) {
                            this.setState({
                              buyConfirmation: true,
                            });
                          } else {
                            document.getElementById("buy-input").style.border =
                              "solid 1px #f45485";
                          }
                        }.bind(this)}
                        className="stockPage__buy-button">
                        BUY
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ul className="loader">
                  <li />
                  <li />
                  <li />
                </ul>
              )}
              <div className="stockPage__keyStats">
                <div className="data">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 22C6.477 22 2 17.523 2 12c0-4.478 2.943-8.268 7-9.542v2.124A8.003 8.003 0 0 0 12 20a8.003 8.003 0 0 0 7.418-5h2.124c-1.274 4.057-5.064 7-9.542 7zm9.95-9H11V2.05c.329-.033.663-.05 1-.05 5.523 0 10 4.477 10 10 0 .337-.017.671-.05 1zM13 4.062V11h6.938A8.004 8.004 0 0 0 13 4.062z" />
                      </g>
                    </svg>{" "}
                    Key Informations
                  </h3>
                  <div className="stockPage__columns">
                    {keyData.map((val, index) => {
                      return (
                        <div className="data__info" key={index}>
                          <h4 className="data__label">
                            {keyDataLabel[parseInt(index)]}
                          </h4>
                          <h3>{val}</h3>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="news">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M4.929 2.929l1.414 1.414A7.975 7.975 0 0 0 4 10c0 2.21.895 4.21 2.343 5.657L4.93 17.07A9.969 9.969 0 0 1 2 10a9.969 9.969 0 0 1 2.929-7.071zm14.142 0A9.969 9.969 0 0 1 22 10a9.969 9.969 0 0 1-2.929 7.071l-1.414-1.414A7.975 7.975 0 0 0 20 10c0-2.21-.895-4.21-2.343-5.657L19.07 2.93zM7.757 5.757l1.415 1.415A3.987 3.987 0 0 0 8 10c0 1.105.448 2.105 1.172 2.828l-1.415 1.415A5.981 5.981 0 0 1 6 10c0-1.657.672-3.157 1.757-4.243zm8.486 0A5.981 5.981 0 0 1 18 10a5.981 5.981 0 0 1-1.757 4.243l-1.415-1.415A3.987 3.987 0 0 0 16 10a3.987 3.987 0 0 0-1.172-2.828l1.415-1.415zM12 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-1 2h2v8h-2v-8z" />
                      </g>
                    </svg>
                    Latest News
                  </h3>
                  <News symbol={symbol} />
                </div>
              </div>
            </div>
          </div>
        )}
        {this.state.valid === false && (
          <div className="wrongSymbol">
            <h1>Unknown Symbol</h1>
            <div className="topbar__searchbar" id="topbar__searchbar">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}>
                <svg
                  enableBackground="new 0 0 250.313 250.313"
                  version="1.1"
                  viewBox="0 0 250.313 250.313"
                  xmlSpace="preserve"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="m244.19 214.6l-54.379-54.378c-0.289-0.289-0.628-0.491-0.93-0.76 10.7-16.231 16.945-35.66 16.945-56.554 0-56.837-46.075-102.91-102.91-102.91s-102.91 46.075-102.91 102.91c0 56.835 46.074 102.91 102.91 102.91 20.895 0 40.323-6.245 56.554-16.945 0.269 0.301 0.47 0.64 0.759 0.929l54.38 54.38c8.169 8.168 21.413 8.168 29.583 0 8.168-8.169 8.168-21.413 0-29.582zm-141.28-44.458c-37.134 0-67.236-30.102-67.236-67.235 0-37.134 30.103-67.236 67.236-67.236 37.132 0 67.235 30.103 67.235 67.236s-30.103 67.235-67.235 67.235z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
                <input
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  type="text"
                  id="searchBar"
                  onKeyUp={this.searchStocks}
                  placeholder="Search by symbol"
                  onFocus={() => {
                    if (document.getElementById("results").firstChild) {
                      document.getElementById("results").style.display = "flex";
                    }
                    document.getElementById(
                      "topbar__searchbar",
                    ).style.boxShadow = "0px 0px 30px 0px rgba(0,0,0,0.10)";
                    document.getElementById("results").style.boxShadow =
                      "0px 30px 20px 0px rgba(0,0,0,0.10)";
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      document.getElementById("results").style.display = "none";
                    }, 400);
                    document.getElementById(
                      "topbar__searchbar",
                    ).style.boxShadow = "none";
                  }}
                  autoComplete="off"
                />
              </div>
              <ul className="topbar__results" id="results" />
            </div>
            <h2>OR</h2>
            <h3>
              Go to <Link to="/dashboard">Dashboard</Link>
            </h3>
          </div>
        )}
      </section>
    );
  }
}
