import React from 'react';
import './App.css';
import TxBuilder from "./transaction-builder-page";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: localStorage.getItem('address'),
      searchBoxId: '',
      searchAddress: '',
    };
    this.setAddress = this.setAddress.bind(this);
  }

  setAddress = (address) => {
    console.log("setAddress", address);
    this.setState({
        address: address
    });
    localStorage.setItem('address', address);
  };

  setSearchBoxId = (searchBoxId) => {
    console.log("setSearchBoxId", searchBoxId);
    this.setState({
      searchBoxId: searchBoxId
    });
  };

  setSearchAddress = (searchAddress) => {
    console.log("setSearchAddress", searchAddress);
    this.setState({
      searchAddress: searchAddress
    });
  };

  render() {
    return (
    <div className="App">
      <header className="App-header">
        <TxBuilder address={this.state.address} 
                   setAddress={this.setAddress}
                   searchBoxId={this.state.searchBoxId}
                   setSearchBoxId={this.setSearchBoxId}
                   searchAddress={this.state.searchAddress}
                   setSearchAddress={this.setSearchAddress}
                   />
      </header>
    </div>
    );
  }

}

