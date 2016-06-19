import React from 'react';
import Datalist from 'react-datalist';

export default class TruckSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
    };
  }

  componentWillReceiveProps() {
    let options = [];
    this.props.trucks.forEach((truck) => {
      options.push(truck.info.applicant + ' @ ' + truck.info.address);
    });
    this.setState({options});
  }

  onOptionSelected(truck) {
    this.props.handleSearch(truck);
  }

  render() {
    return (
      <div className={'searchTrucks'}>
        <h2 style={{color: 'lightgrey'}}>Find a Food Truck!</h2>
        <Datalist
          className='truckOptionList'
          list='truckOptions'
          options= {this.state.options}
          placeholder='e.g. Senor Sisig'
          onOptionSelected={this.onOptionSelected.bind(this)}/>
      </div>
    )
  }
}
