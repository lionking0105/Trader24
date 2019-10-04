import React from "react";
import { Link } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/firestore";

let usersInfo = {
  username: [],
  email: [],
  currentFunds: [],
  positions: [],
  isAdmin: []
};

export default class Admin extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
  }
  loadUsers() {
    firebase
      .firestore()
      .collection("users")
      .get()
      .then(snapshot => {
        if (snapshot.docs.length !== 0 && usersInfo.isAdmin.length === 0) {
          snapshot.forEach(doc => {
            usersInfo.username.push(doc.data().username);
            usersInfo.email.push(doc.data().email);
            usersInfo.currentFunds.push(doc.data().currentfunds);
            usersInfo.positions.push(doc.data().positions);
            usersInfo.isAdmin.push(doc.data().admin);
          });
        }
      })
      .then(()=>{
        if (usersInfo.isAdmin.length > 0 && this._isMounted) {
          this.setState({
            loaded: true
          });
        }
        else if(this._isMounted){
          this.setState({
            loaded: "nothing"
          });
        }
      })
  }
  componentWillUnmount(){
    this._isMounted = false;

  }
  componentDidMount() {
    this._isMounted = true;
    this.loadUsers();
  }

  numberWithCommas(x) {
    if (x !== undefined) return x.toLocaleString();
    else return "";
  }
  editFunds({ target }) {
    console.log(target.value);
  }

  render() {
    return (
      <div className="devPanel">
        <div className="topbar">
          <h1>DEV PANEL</h1>
          <Link to="/dashboard">
            <div className="topbar__dev">
              <h4>DASHBOARD</h4>
            </div>
          </Link>
        </div>
        <div className="devPanel__content">
          {this.state.loaded ? (
            <table>
              <tbody>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Current Money</th>
                  <th>Opened positions</th>
                  <th>Is admin</th>
                </tr>
                {usersInfo.username.map((val, index) => (
                  <tr key={index}>
                    <td>{val}</td>
                    <td>{usersInfo.email[index]}</td>
                    <td>
                      <input
                        name={val}
                        type="text"
                        placeholder={usersInfo.currentFunds[index]}
                        onKeyDown={this.editFunds}
                      />
                    </td>
                    <td>{usersInfo.positions[index]}</td>
                    <td>{usersInfo.isAdmin[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="loader">
              <li />
              <li />
              <li />
            </ul>
          )}
        </div>
      </div>
    );
  }
}
