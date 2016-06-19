import React from 'react';

export default class ClosestListEntry extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const truck = this.props.truck;
    return (
      <div onClick={this.props.handleClick} className={'listEntry'}>
        <h4>{truck.info.applicant}</h4>
        <p>Address: {truck.info.address}</p>
        <p>Hours: {truck.info.dayshours}</p>
        <p>{truck.info.fooditems}</p>
        <p>Schedule: <a href={truck.info.schedule}>{truck.info.applicant}</a></p>
      </div>
    )
  }
}
